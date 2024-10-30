module.exports = async ({
  constants: { package },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('NVM_VERSION', dockerfile);
  const latestVersion = await runtime.getLatestReleaseTagName({ owner: 'nvm-sh', repo: 'nvm' });
  if (semver.lt(currentVersion, latestVersion)) {
    dockerfile = runtime.replaceVariable('NVM_VERSION', latestVersion, dockerfile);
    await runtime.updateFileAndCreatePullRequest(package, latestVersion, {
      Dockerfile: dockerfile,
      'tags.yml': runtime.dumpImageTags([semver.clean(latestVersion, { loose: true }), 'latest']),
    });
    return latestVersion;
  }
  return null;
};
