module.exports = async ({
  constants: { package },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  const latestVersion = await runtime.latestDebianPackageVersion('subversion');

  if (latestVersion === '') return null;

  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getDockerfileEnvVersion('SUBVERSION_VERSION', dockerfile);

  if (latestVersion != currentVersion) {
    dockerfile = runtime.replaceVariable('SUBVERSION_VERSION', latestVersion, dockerfile);
    const cleanedVersion = runtime.debianPackageVersionClean(latestVersion);
    await runtime.updateFileAndCreatePullRequest(package, cleanedVersion, {
      Dockerfile: dockerfile,
      'tags.yml': runtime.dumpImageTags([semver.clean(cleanedVersion, { loose: true }), 'latest']),
    });
    return latestVersion;
  }
  return null;
};
