module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const cheerio = require('cheerio');
  let response = await runtime.retryFetch('https://packages.debian.org/bookworm/subversion');
  const html = await response.text();
  const $ = cheerio.load(html);
  const latestVersion = $($('.vcurrent')[0]).text().trim();

  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('SUBVERSION_VERSION', dockerfile);

  if (currentVersion != latestVersion) {
    dockerfile = runtime.replaceVariable('SUBVERSION_VERSION', latestVersion, dockerfile);
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, `${path}/Dockerfile`, dockerfile);
    return latestVersion;
  }
  return null;
};
