module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const cheerio = require('cheerio');
  const response = await fetch('https://packages.debian.org/bookworm/subversion');
  const html = await response.text();
  const $ = cheerio.load(html);
  const latestVersion = $($('.dl_version_number')[0]).text().get();

  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('SUBVERSION_VERSION', dockerfile);

  if (currentVersion != latestVersion) {
    dockerfile = runtime.replaceVersion(['SUBVERSION_VERSION'], latestVersion, dockerfile);
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, `${path}/Dockerfile`, dockerfile);
    return latestVersion;
  }
  return null;
};
