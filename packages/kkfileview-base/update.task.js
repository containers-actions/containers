module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  const cheerio = require('cheerio');
  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('LIBRE_OFFICE_VERSION', dockerfile);
  const response = await runtime.retryFetch('https://www.libreoffice.org/download/download-libreoffice');
  const html = await response.text();
  const $ = cheerio.load(html);
  const latestVersion = semver.minSatisfying(
    $('.dl_version_number')
      .map((i, e) => $(e).text())
      .get(),
    '*'
  );
  if (semver.lt(currentVersion, latestVersion)) {
    dockerfile = runtime.replaceVariable('LIBRE_OFFICE_VERSION', latestVersion, dockerfile);
    dockerfile = dockerfile.replace(
      /KK_OFFICE_HOME="\/opt\/libreoffice([\d.]+)"/g,
      `KK_OFFICE_HOME="/opt/libreoffice${semver.major(latestVersion)}.${semver.minor(latestVersion)}"`
    );
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, {
      [`${path}/Dockerfile`]: dockerfile,
    });
    return latestVersion;
  }
  return null;
};
