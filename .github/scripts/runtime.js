module.exports = (scripts) => {
  const { github, context, core, glob, io, exec, require } = scripts;
  // actions/github-script v7+ 不再注入 fetch，回退到 Node 运行时全局 fetch
  const fetch = scripts.fetch ?? globalThis.fetch;
  const { PassThrough } = require('stream');
  const fs = require('fs');
  const semver = require('semver');
  const yaml = require('js-yaml');
  const actions = {
    const: { PACKAGE_DIR: 'packages' },
    // ============================== Common ==============================
    retryFetch: async (url, options = {}, maxRetry = 5, retryInterval = 1000) => {
      let lastError;
      for (let i = 0; i < maxRetry; i++) {
        try {
          return await fetch(url, options);
        } catch (e) {
          lastError = e;
          core.info(`[url] ${url} 第${i + 1}次请求失败: ${e.message}`);
          if (i !== maxRetry - 1) {
            await actions.sleep(retryInterval);
          }
        }
      }
      throw new Error(`[url] ${url} 重试 ${maxRetry} 次后仍失败: ${lastError.message}`);
    },
    sleep: async (ms, callback = () => {}) => {
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve();
          callback && callback();
        }, ms)
      );
    },
    printlnWarpText: (str, width = 52) => {
      let context = str;
      if (str.length % 2 == 1) {
        context += ' ';
      }
      core.info(`┏${'━'.repeat(width - 2)}┓`);
      let blank = ' '.repeat((width - 2) / 2 - context.length / 2);
      core.info(`┃${blank}${context}${blank}┃`);
      core.info(`┗${'━'.repeat(width - 2)}┛`);
    },
    getDockerfileEnvVersion: (key, content) => {
      const regex = new RegExp(`(${key})="?(?<version>v?[\\d\\w.+-:]+)"?`, 'gm');
      const match = regex.exec(content);
      if (match == null) {
        throw new Error(`Dockerfile 中未找到变量 ${key}`);
      }
      return match.groups['version'];
    },
    getVersion: (content) => {
      const regex = new RegExp(`(?<version>v?[\\d.]+-?[\\w+-]+)`, 'g');
      const match = regex.exec(content);
      if (match == null) {
        throw new Error(`无法从 ${content} 中解析版本号`);
      }
      return match.groups['version'];
    },
    replaceVariable: (key, value, content) => {
      const regex = new RegExp(`^(\\w*\\s*)(${key})="?([^"]+)"?(\\s*\\\\)?[^\\S\\n]*$`, 'gm');
      return content.replace(regex, `$1$2="${value}"$4`);
    },
    /**
     * 从指定的路径读取一个文件
     *
     * @param {string} path 文件的路径
     * @return {string}     文件的内容
     */
    readFile: (path) => {
      return fs.readFileSync(path, 'utf8');
    },
    /**
     * 读取Dockerfile
     *
     * @param {string} package 包
     * @returns {string}       文件内容
     */
    readDockerfile: (package) => {
      return actions.readFile(`${actions.const.PACKAGE_DIR}/${package}/Dockerfile`);
    },
    readBuildPlatform: (package) => {
      return actions
        .readFile(`${actions.const.PACKAGE_DIR}/${package}/Platformfile`)
        .split('\n')
        .filter((x) => x);
    },
    readDockerRegistrys: () => {
      return yaml.load(actions.readFile('.github/docker-registry.yml')).registrys;
    },
    isDirectory: (path) => {
      try {
        return fs.statSync(path).isDirectory();
      } catch (error) {
        return false;
      }
    },
    readYaml: (path) => {
      return yaml.load(actions.readFile(path));
    },
    readImageTags: (package) => {
      return actions.readYaml(`${actions.const.PACKAGE_DIR}/${package}/tags.yml`)['rolling-tags'];
    },
    dumpImageTags: (tags) => {
      return yaml.dump({ 'rolling-tags': tags });
    },
    getImageAnnotation: (package, version, customizeAnnotation = {}) => {
      const annotations = {
        'org.opencontainers.image.authors': 'fangzhengjin <fangzhengjin@gmail.com>',
        'org.opencontainers.image.title': package,
        'org.opencontainers.image.description': package,
        'org.opencontainers.image.source': 'https://github.com/containers-actions/containers',
        'org.opencontainers.image.licenses': 'MIT',
        'org.opencontainers.image.version': version,
      };
      Object.keys(customizeAnnotation).forEach((key) => {
        annotations[key] = customizeAnnotation[key];
      });
      return annotations;
    },
    /**
     * 获取指定所有者和仓库的最新 Release。
     *
     * @param {{owner: string, repo: string}} params 获取最新版本发布的参数
     */
    getLatestReleaseData: async ({ owner, repo }) => {
      return (await github.rest.repos.getLatestRelease({ owner, repo })).data;
    },
    /**
     * 获取指定所有者和仓库的最新版本发布名称。
     *
     * @param {{owner: string, repo: string}} params 获取最新版本发布的参数
     * @return {string}                               最新版本发布tag的名称
     */
    getLatestReleaseTagName: async ({ owner, repo }) => {
      const tagName = (await actions.getLatestReleaseData({ owner, repo })).tag_name;
      return actions.getVersion(tagName)
    },
    // ============================== Reference ==============================
    getRef: async (ref) => {
      return (await github.rest.git.getRef({ ...context.repo, ref })).data;
    },
    updateRef: async (ref, sha) => {
      return await github.rest.git.updateRef({ ...context.repo, ref, sha });
    },
    deleteRef: async (ref) => {
      const result = await github.rest.git.deleteRef({ ...context.repo, ref });
      return result.status === 204;
    },
    getBranch: async (branch) => {
      return await actions.getRef(`heads/${branch}`);
    },
    /**
     * 创建新分支
     *
     * @param {string} originBranch 原分支名
     * @param {string} newBranch    新分支名
     * @returns {boolean}           新建成功返回 true；分支已存在返回 false（调用方据此跳过重复更新，保持幂等）
     */
    createBranch: async (originBranch, newBranch) => {
      try {
        await actions.getBranch(newBranch);
        return false;
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
        const originRef = await actions.getBranch(originBranch);
        const newRef = await github.rest.git.createRef({
          ...context.repo,
          ref: `refs/heads/${newBranch}`,
          sha: originRef.object.sha,
        });
        return newRef.status === 201;
      }
    },
    updateBranch: async (branch, sha) => {
      return await actions.updateRef(`heads/${branch}`, sha);
    },
    deleteBranch: async (branch) => await actions.deleteRef(`heads/${branch}`),
    // ============================== Label ==============================
    listLabelsForRepo: async () => {
      return (await github.rest.issues.listLabelsForRepo({ ...context.repo })).data || [];
    },
    createLabel: async (name, color) => {
      return (await github.rest.issues.createLabel({ ...context.repo, name, color })).status === 201;
    },
    setLabels: async (issueNumber, labels) => {
      const repoLabels = (await actions.listLabelsForRepo()).map((x) => x.name);
      // 标签必须创建完成后再 setLabels，否则 pr-check（labeled 触发）不会执行
      for (const label of labels) {
        if (!repoLabels.includes(label)) {
          await actions.createLabel(label, 'FBCA04');
        }
      }
      return await github.rest.issues.setLabels({ ...context.repo, issue_number: issueNumber, labels });
    },
    // ============================== Repo ==============================
    /**
     * 更新文件内容并将更改提交到 GitHub 存储库。
     *
     * @param {[{path: string, content: string, mode: string, type: string}]} files              要更新的文件信息
     * @param {string} message      文件更新的提交消息
     * @returns {Promise<Object>}   一个解析为 GitHub API 响应对象的 Promise
     */
    updateFiles: async (branch, files, message) => {
      const ref = await actions.getBranch(branch);
      const tree = await github.rest.git.createTree({
        ...context.repo,
        base_tree: ref.object.sha,
        tree: files,
      });
      const commit = await github.rest.git.createCommit({
        ...context.repo,
        message,
        tree: tree.data.sha,
        parents: [ref.object.sha],
      });
      return (await actions.updateBranch(branch, commit.data.sha)).status === 200;
    },
    // ============================== Issue / PullRequest ==============================
    /**
     * 创建一个GitHub上的Pull Request
     *
     * @param {string} formBranch Pull Request的来源分支
     * @param {string} toBranch   Pull Request的目标分支
     * @param {string} title      Pull Request的标题
     * @param {string} body       Pull Request的内容
     * @return {boolean}          是否创建成功
     */
    createPullRequest: async (formBranch, toBranch, title, body) => {
      return await github.rest.pulls.create({
        ...context.repo,
        head: formBranch,
        base: toBranch,
        title,
        body,
        maintainer_can_modify: true,
      });
    },
    createIssueComment: async (issueNumber, comment) => {
      const result = await github.rest.issues.createComment({
        ...context.repo,
        issue_number: issueNumber,
        body: comment,
      });
      return result.status === 201;
    },
    listPullRequestFiles: async (pullNumber) => {
      const result = await github.rest.pulls.listFiles({
        ...context.repo,
        pull_number: pullNumber,
      });
      if (result.status === 200) {
        return result.data;
      }
      return [];
    },
    listPullRequest: async (state = 'all') => {
      const result = await github.rest.pulls.list({
        ...context.repo,
        state,
      });
      if (result.status === 200) {
        return result.data;
      }
      return [];
    },
    /**
     *
     * @param {*} pullNumber
     * @param options title,body,state,base,maintainer_can_modify
     */
    updatePullRequest: async (pullNumber, options = {}) => {
      const result = await github.rest.pulls.update({
        ...context.repo,
        pull_number: pullNumber,
        ...options,
      });
      if (result.status === 200) {
        return true;
      }
      return false;
    },
    closePullRequest: async (pullNumber) => {
      return await actions.updatePullRequest(pullNumber, { state: 'closed' });
    },
    // ============================== Remix ==============================
    autoPullRequest: async (newBranch, package, version, uploadCallback) => {
      let branchCreated = await actions.createBranch('main', newBranch);
      if (!branchCreated) {
        // 分支已存在：无关联 open PR 时为半完成残留（建分支后上传失败等），删除重建以自愈
        const openPRs = (await actions.listPullRequest('open')).filter((pr) => pr.head.ref === newBranch);
        if (openPRs.length === 0) {
          await actions.deleteBranch(newBranch);
          branchCreated = await actions.createBranch('main', newBranch);
        }
      }
      if (branchCreated && (await uploadCallback())) {
        const title = `Upgrade ${package} version to ${version}`;
        const prInfo = await actions.createPullRequest(newBranch, 'main', title, title);
        if (prInfo.status === 201) {
          await actions.setLabels(prInfo.data.number, [`${actions.const.PACKAGE_DIR}/${package}`]);
          return true;
        }
      }
      return false;
    },
    mergePullRequestSquash: async (pullNumber, maxRetry = 5) => {
      try {
        const result = await github.rest.pulls.merge({
          ...context.repo,
          pull_number: pullNumber,
          merge_method: 'squash',
        });
        return result.status === 200;
      } catch (error) {
        // 405: PR 尚未满足合并条件（如刚推送 CI 未完成），短暂等待后重试
        if (error.status === 405 && maxRetry > 0) {
          await actions.sleep(5000);
          return await actions.mergePullRequestSquash(pullNumber, maxRetry - 1);
        }
        core.error(`合并 PR #${pullNumber} 失败: ${error.status} ${error.message}`);
        return false;
      }
    },
    /**
     *
     * @param {*} package
     * @param {*} latestVersion
     * @param {{[path: string]: [content: string]}} uploads 上传的文件信息, 其中path为相对当前包的文件路径, content为base64的文件内容
     */
    updateFileAndCreatePullRequest: async (package, latestVersion, uploads) => {
      const newLatestVersion = semver.clean(latestVersion, { loose: true });
      const newBranch = `${package}/${newLatestVersion}`;
      return await actions.autoPullRequest(newBranch, package, newLatestVersion, async () => {
        return await actions.updateFiles(
          newBranch,
          // https://docs.github.com/zh/rest/git/trees?apiVersion=2022-11-28#create-a-tree
          Object.keys(uploads).map((x) => ({
            path: `${actions.const.PACKAGE_DIR}/${package}/${x}`,
            mode: '100644',
            type: 'blob',
            content: uploads[x],
          })),
          `build: Update ${package} version to ${newLatestVersion}`
        );
      });
    },
    latestDebianPackageVersion: async (packageName, debianVersion = 'trixie') => {
      const result = await exec.getExecOutput(
        `docker run --rm debian:${debianVersion} sh -c "apt update > /dev/null 2>&1 && apt-cache policy ${packageName} | awk -F': ' '/Candidate/ {print $2}'"`,
        [],
        { silent: true, outStream: new PassThrough() }
      );
      if (result.exitCode === 0 && result.stdout !== '') {
        return result.stdout.trim();
      }
      throw new Error(`查询 Debian 包 ${packageName} 候选版本失败: exitCode=${result.exitCode}`);
    },
    debianPackageVersionClean: (version) => {
      let cleanedVersion = version;
      cleanedVersion = cleanedVersion.slice(cleanedVersion.indexOf(':') + 1);
      cleanedVersion = cleanedVersion.replace('+', '-');
      return cleanedVersion;
    },
    // ============================== Task Factory ==============================
    /**
     * 构建基于 GitHub Release 的版本更新任务
     *
     * @param {{owner: string, repo: string, envKey: string}} config 上游仓库与 Dockerfile 中的版本变量名
     */
    githubReleaseTask: ({ owner, repo, envKey }) => {
      return async ({ constants: { package }, scripts, runtime }) => {
        const semver = scripts.require('semver');
        let dockerfile = runtime.readDockerfile(package);
        const currentVersion = runtime.getDockerfileEnvVersion(envKey, dockerfile);
        const latestVersion = await runtime.getLatestReleaseTagName({ owner, repo });
        if (semver.lt(currentVersion, latestVersion)) {
          dockerfile = runtime.replaceVariable(envKey, latestVersion, dockerfile);
          const created = await runtime.updateFileAndCreatePullRequest(package, latestVersion, {
            Dockerfile: dockerfile,
            'tags.yml': runtime.dumpImageTags([semver.clean(latestVersion, { loose: true }), 'latest']),
          });
          return created ? latestVersion : null;
        }
        return null;
      };
    },
    /**
     * 构建基于 Debian 仓库候选版本的更新任务
     *
     * @param {{packageName?: string, envKey: string, debianVersion?: string}} config Debian 包名与 Dockerfile 中的版本变量名，缺省包名与包目录同名
     */
    debianPackageTask: ({ packageName, envKey, debianVersion }) => {
      return async ({ constants: { package }, scripts, runtime }) => {
        const semver = scripts.require('semver');
        const latestVersion = await runtime.latestDebianPackageVersion(packageName || package, debianVersion);
        let dockerfile = runtime.readDockerfile(package);
        const currentVersion = runtime.getDockerfileEnvVersion(envKey, dockerfile);
        if (latestVersion != currentVersion) {
          dockerfile = runtime.replaceVariable(envKey, latestVersion, dockerfile);
          const cleanedVersion = runtime.debianPackageVersionClean(latestVersion);
          const created = await runtime.updateFileAndCreatePullRequest(package, cleanedVersion, {
            Dockerfile: dockerfile,
            'tags.yml': runtime.dumpImageTags([semver.clean(cleanedVersion, { loose: true }), 'latest']),
          });
          return created ? latestVersion : null;
        }
        return null;
      };
    },
  };
  return actions;
};
