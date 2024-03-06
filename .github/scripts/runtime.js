module.exports = (scripts) => {
  const { github, context, core, glob, io, exec, fetch, require } = scripts;
  const fs = require('fs');
  const semver = require('semver');
  const yaml = require('js-yaml');
  const actions = {
    const: { PACKAGE_DIR: 'packages' },
    // ============================== Common ==============================
    /**
     *
     * @param {() => Promise<boolean>} tasks
     * @returns boolean[]
     */
    promiseStep: async (tasks = []) => {
      const result = [];
      for (const task of tasks) {
        try {
          result.push(await task());
        } catch (error) {
          result.push(false);
        }
      }
      return result;
    },
    retryFetch: async (url, options = {}, maxRetry = 5, retryInterval = 1000) => {
      for (let i = 0; i < maxRetry; i++) {
        try {
          return await fetch(url, options);
        } catch (e) {
          core.info(`[url] 正在进行第[${i + 1}]次重试`);
          if (i !== maxRetry - 1) {
            await actions.sleep(retryInterval);
          }
        }
      }
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
    getVersion: (key, content) => {
      const regex = new RegExp(`(${key})="?(?<version>v?[\\d\\w.+-]+)"?`, 'gm');
      return regex.exec(content).groups['version'];
    },
    replaceVariable: (key, value, content) => {
      const regex = new RegExp(`^(\\w*\\s*)(${key})="?([^"]+)"?(\\s*\\\\)?[^\\S\\n]*$`, 'gm');
      return content.replace(regex, `$1$2="${value}"$4`);
    },
    /**
     * 获取指定密钥名称的秘密值
     *
     * @param {string} secretName   密钥名称
     * @return {string}             密钥的值
     */
    getSecret: (secretName) => {
      return JSON.parse(process.env.SECRETS || '{}')[secretName];
    },
    /**
     * 从指定的路径和文件名读取一个文件
     *
     * @param {string} path     文件的路径
     * @param {string} fileName 文件的名称
     * @return {string}         文件的内容
     */
    readFile: (path) => {
      return fs.readFileSync(path, 'utf8');
    },
    writeFile: (path, value) => {
      return fs.writeFileSync(path, value);
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
    writeDockerfile: (package, value) => {
      return actions.writeFile(`${actions.const.PACKAGE_DIR}/${package}/Dockerfile`, value);
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
     * 获取指定所有者和仓库的最新版本发布名称。
     *
     * @param {{owner: string, repo: string}} params  获取最新版本发布的参数
     * @return {string}                               最新版本发布的名称
     */
    getLatestRelease: async ({ owner, repo }) => {
      return (await github.rest.repos.getLatestRelease({ owner, repo })).data.name;
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
     * @returns {boolean}           是否创建成功
     */
    createBranch: async (originBranch, newBranch) => {
      try {
        await actions.getBranch(newBranch);
      } catch (error) {
        if (error.status === 404) {
          const originRef = await actions.getBranch(originBranch);
          const newRef = await github.rest.git.createRef({
            ...context.repo,
            ref: `refs/heads/${newBranch}`,
            sha: originRef.object.sha,
          });
          return true;
        }
      }
      return false;
    },
    updateBranch: async (branch, sha) => {
      return await actions.updateRef(`heads/${branch}`, sha);
    },
    deleteBranch: async (branch) => await actions.deleteRef(`heads/${branch}`),
    deleteTag: async (tag) => await actions.deleteRef(`tags/${tag}`),
    // ============================== Label ==============================
    listLabelsOnIssue: async (issueNumber) => {
      return (await github.rest.issues.listLabelsOnIssue({ ...context.repo, issue_number: issueNumber })).data;
    },
    listLabelsForRepo: async () => {
      return (await github.rest.issues.listLabelsForRepo({ ...context.repo })).data || [];
    },
    createLabel: async (name, color) => {
      return (await github.rest.issues.createLabel({ ...context.repo, name, color })).status === 201;
    },
    setLabels: async (issueNumber, labels) => {
      const repoLabels = (await actions.listLabelsForRepo()).map((x) => x.name);
      labels.forEach(async (label) => {
        if (!repoLabels.includes(label)) {
          await actions.createLabel(label, 'FBCA04');
        }
      });
      return await github.rest.issues.setLabels({ ...context.repo, issue_number: issueNumber, labels });
    },
    // ============================== Repo ==============================
    /**
     * 从GitHub仓库中获取文件的内容
     *
     * @param {string} path 文件路径
     * @return {string}     文件的内容
     */
    getContent: async (ref, path) => {
      return (await github.rest.repos.getContent({ ...context.repo, ref, path })).data;
    },
    /**
     * 更新文件内容并将更改提交到 GitHub 存储库。
     *
     * @param {string} filePath     要更新的文件路径
     * @param {string} content      要写入文件的新内容
     * @param {string} message      文件更新的提交消息
     * @returns {Promise<Object>}   一个解析为 GitHub API 响应对象的 Promise
     */
    updateFile: async (branch, filePath, content, message) => {
      let fileInfo = {};
      try {
        fileInfo = await actions.getContent(branch, filePath);
      } catch (error) {}
      const result = await github.rest.repos.createOrUpdateFileContents({
        ...context.repo,
        path: filePath,
        message,
        branch,
        sha: fileInfo.sha,
        content: Buffer.from(content).toString('base64'),
      });
      return result.status === 200 || result.status === 201;
    },
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
    openPullRequest: async (pullNumber) => {
      return await actions.updatePullRequest(pullNumber, { state: 'open' });
    },
    // ============================== Remix ==============================
    autoPullRequest: async (newBranch, package, version, uploadCallback) => {
      if ((await actions.createBranch('main', newBranch)) && (await uploadCallback())) {
        const title = `Upgrade ${package} version to ${version}`;
        const prInfo = await actions.createPullRequest(newBranch, 'main', title, title);
        if (prInfo.status === 201) {
          await actions.setLabels(prInfo.data.number, [`${actions.const.PACKAGE_DIR}/${package}`]);
        }
      }
    },
    mergePullRequestSquash: async (pullNumber) => {
      try {
        const result = await github.rest.pulls.merge({
          ...context.repo,
          pull_number: pullNumber,
          merge_method: 'squash',
        });
        return result.status === 200;
      } catch (error) {
        if (error.status === 405) {
          await actions.sleep(5000);
          await actions.mergePullRequestSquash(pullNumber);
        }
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
      await actions.autoPullRequest(newBranch, package, newLatestVersion, async () => {
        return await actions.updateFiles(
          newBranch,
          // https://docs.github.com/zh/rest/git/trees?apiVersion=2022-11-28#create-a-tree
          Object.keys(uploads).map((x) => ({
            path: `${actions.const.PACKAGE_DIR}/${package}/${x}`,
            mode: '100644',
            type: 'blob',
            content: uploads[x],
          })),
          `Update ${package} version to ${newLatestVersion}`
        );
        // return (
        //   await actions.promiseStep([
        //     ...Object.keys(uploads).map(
        //       (path) => async () =>
        //         actions.updateFile(
        //           newBranch,
        //           `${actions.const.PACKAGE_DIR}/${package}/${path}`,
        //           uploads[path],
        //           `Update ${package} version to ${newLatestVersion}`
        //         )
        //     ),
        //   ])
        // ).every((x) => x);
      });
    },
  };
  return actions;
};
