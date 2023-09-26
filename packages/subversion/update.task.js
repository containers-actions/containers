module.exports = async ({
  constants: { package },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  const cheerio = require('cheerio');
  let response = await runtime.retryFetch('https://packages.debian.org/bookworm/subversion');
  const html = await response.text();
  const $ = cheerio.load(html);
  const latestVersion = $($('.vcurrent')[0]).text().trim();

  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('SUBVERSION_VERSION', dockerfile);

  if (currentVersion != latestVersion) {
    dockerfile = runtime.replaceVariable('SUBVERSION_VERSION', latestVersion, dockerfile);
    await runtime.updateFileAndCreatePullRequest(package, latestVersion, {
      Dockerfile: dockerfile,
      'tags.yml': runtime.dumpImageTags([semver.clean(latestVersion, { loose: true }), 'latest']),
    });
    return latestVersion;
  }
  return null;
};
