module.exports = async ({
  constants: { package },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  const latestVersion = await runtime.latestDebianPackageVersion('libreoffice-nogui');

  if (latestVersion === '') return null;

  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getDockerfileEnvVersion('LIBREOFFICE_VERSION', dockerfile);

  if (latestVersion != currentVersion) {
    dockerfile = runtime.replaceVariable('LIBREOFFICE_VERSION', latestVersion, dockerfile);
    const cleanedVersion = runtime.debianPackageVersionClean(latestVersion);
    await runtime.updateFileAndCreatePullRequest(package, cleanedVersion, {
      Dockerfile: dockerfile,
      'tags.yml': runtime.dumpImageTags([semver.clean(cleanedVersion, { loose: true }), 'latest']),
    });
    return latestVersion;
  }
  return null;
};
