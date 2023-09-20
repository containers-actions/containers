module.exports = (scripts) => {
  const { github, context, core, glob, io, exec, fetch, require } = scripts;
  const fs = require('fs');
  const actions = {
    sleep: async (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    },
    printlnWarpText: (str, width = 52) => {
      core.info(`┏${'━'.repeat(width - 2)}┓`);
      let blank = ' '.repeat((width - 2) / 2 - Math.floor(str.length / 2));
      core.info(`┃${blank}${str}${blank}┃`);
      core.info(`┗${'━'.repeat(width - 2)}┛`);
    },
    replaceVersion: (keys, version, content) => {
      const regex = new RegExp(`(${keys.join('|')})="(v?[\\d.]+)"`, 'g');
      return content.replace(regex, `$1="${version}"`);
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
     * 从指定的路径和文件名读取一个包文件
     *
     * @param {string} path     文件的路径
     * @param {string} fileName 文件的名称
     * @return {string}         文件的内容
     */
    readPackageFile: (path, fileName) => {
      return fs.readFileSync(`${path}/${fileName}`, 'utf8');
    },
    writePackageFile: (path, fileName, value) => {
      return fs.writeFileSync(`${path}/${fileName}`, value);
    },
    /**
     * 读取Dockerfile
     *
     * @param {string} package 包
     * @returns {string}       文件内容
     */
    readDockerfile: (package) => {
      return actions.readPackageFile(`packages/${package}`, 'Dockerfile');
    },
    writeDockerfile: (package, value) => {
      return actions.writePackageFile(`packages/${package}`, 'Dockerfile', value);
    },
    readBuildPlatform: (package) => {
      return actions
        .readPackageFile(`packages/${package}`, 'Platformfile')
        .split('\n')
        .filter((x) => x);
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
    /**
     * 创建新分支
     *
     * @param {string} originBranch 原分支名
     * @param {string} newBranch    新分支名
     * @returns {boolean}           是否创建成功
     */
    createNewBranch: async (originBranch, newBranch) => {
      try {
        await github.rest.git.getRef({ ...context.repo, ref: `heads/${newBranch}` });
      } catch (error) {
        if (error.status === 404) {
          const originRef = await github.rest.git.getRef({ ...context.repo, ref: `heads/${originBranch}` });
          const newRef = await github.rest.git.createRef({
            ...context.repo,
            ref: `refs/heads/${newBranch}`,
            sha: originRef.data.object.sha,
          });
          return true;
        }
      }
      return false;
    },
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
      const fileInfo = await actions.getContent(branch, filePath);
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
    autoPullRequest: async (newBranch, package, version, uploadCallback) => {
      if ((await actions.createNewBranch('main', newBranch)) && (await uploadCallback())) {
        const title = `Upgrade ${package} version to ${version}`;
        const prInfo = await actions.createPullRequest(newBranch, 'main', title, title);
        if (prInfo.status === 201) {
          await actions.setLabels(prInfo.data.number, [`packages/${package}`]);
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
    deleteRef: async (ref) => {
      const result = await github.rest.git.deleteRef({ ...context.repo, ref });
      return result.status === 204;
    },
    deleteBranch: async (branch) => await actions.deleteRef(`heads/${branch}`),
    deleteTag: async (tag) => await actions.deleteRef(`tags/${tag}`),
    createIssueComment: async (issueNumber, comment) => {
      const result = await github.rest.issues.createComment({
        ...context.repo,
        issue_number: issueNumber,
        body: comment,
      });
      return result.status === 201;
    },
    uploadFileAndCreatePullRequest: async (package, latestVersion, uploadPath, content) => {
      const newBranch = `${package}-${latestVersion}`;
      await actions.autoPullRequest(newBranch, package, latestVersion, async () => {
        return await actions.updateFile(
          newBranch,
          uploadPath,
          content,
          `Update ${package} version to ${latestVersion}`
        );
      });
    },
  };
  return actions;
};
