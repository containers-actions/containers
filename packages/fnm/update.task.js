module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('FNM_VERSION', dockerfile);
  const latestVersion = await runtime.getLatestRelease({ owner: 'Schniz', repo: 'fnm' });
  if (semver.lt(currentVersion, latestVersion)) {
    dockerfile = runtime.replaceVariable('FNM_VERSION', latestVersion, dockerfile);
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, {
      [`${path}/Dockerfile`]: dockerfile,
    });
    return latestVersion;
  }
  return null;
};
