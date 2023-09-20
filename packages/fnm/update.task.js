module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  let dockerfile = runtime.readDockerfile(package);
  // 在dockerfile中查找环境变量FNM_VERSION的值 FNM_VERSION="v1.35.1"
  const regex = /FNM_VERSION="(v[\d.]+)"/g;
  const result = regex.exec(dockerfile);
  if (result == null || result.length < 2) {
    return;
  }
  const currentVersion = result[1];
  const latestVersion = await runtime.getLatestRelease({ owner: 'Schniz', repo: 'fnm' });
  if (semver.lt(currentVersion, latestVersion)) {
    dockerfile = runtime.replaceVersion(['FNM_VERSION'], latestVersion, dockerfile);
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, `${path}/Dockerfile`, dockerfile);
    return latestVersion;
  }
  return null;
};
