module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('NVM_VERSION', dockerfile);
  const latestVersion = await runtime.getLatestRelease({ owner: 'nvm-sh', repo: 'nvm' });
  if (semver.lt(currentVersion, latestVersion)) {
    dockerfile = runtime.replaceVariable('NVM_VERSION', latestVersion, dockerfile);
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, {
      [`${path}/Dockerfile`]: dockerfile,
    });
    return latestVersion;
  }
  return null;
};
