module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  const response = await runtime.retryFetch('https://www.mathworks.com/products/compiler/matlab-runtime.html');
  const html = await response.text();
  const versions = {};
  const patchVersion = {};
  for (const match of html.matchAll(/MATLAB_Runtime_(?<v1>\w\d{2,4}\w)_(?:Update_(?<p>\d+)_)?glnxa64\.zip/gm)) {
    const { v1, p } = match.groups;
    if (p) {
      patchVersion[v1] = p;
    } else {
      patchVersion[v1] = '0';
    }
  }

  const getLdLibraryPath = (v1Raw, v2) => {
    let version;
    if (semver.gte(semver.coerce(v2), semver.coerce('9.13'), true)) {
      version = v1Raw;
    } else {
      version = `v${v2.replace('.', '')}`;
    }
    const ldLibraryPaths = [];
    ldLibraryPaths.push(`/MATLAB_Runtime/${version}/runtime/glnxa64`);
    ldLibraryPaths.push(`/MATLAB_Runtime/${version}/bin/glnxa64`);
    ldLibraryPaths.push(`/MATLAB_Runtime/${version}/sys/os/glnxa64`);
    ldLibraryPaths.push(`/MATLAB_Runtime/${version}/extern/bin/glnxa64`);
    return ldLibraryPaths.join(':');
  };

  const getInstallParam = (version) => {
    const installParams = [];
    installParams.push('-agreeToLicense yes');
    installParams.push('-destinationFolder /MATLAB_Runtime');
    if (semver.lte(semver.coerce(version), semver.coerce('9.12'), true)) {
      installParams.push('-mode silent');
    }
    return installParams.join(' ');
  };

  for (const match of html.matchAll(/<td>(?<v1>\w\d{4}\w)\s+\((?<v2>[\d.]+)\)(?:<br>)?<\/td>/gm)) {
    const { v1, v2 } = match.groups;
    if (runtime.dirExists(`package/${v1}`)) {
      const v3 = patchVersion[v1];
      const versionPrune = `${/(?<v>\d+)/.exec(v1).groups['v']}.${v2}-${v3}`; // 2023.9.14-5
      versions[versionPrune] = {
        url: `https://ssd.mathworks.com/supportfiles/downloads/${v1}/Release/${v3}/deployment_files/installer/complete/glnxa64/MATLAB_Runtime_${v1}_${
          v3 == '0' ? '' : `Update_${v3}_`
        }glnxa64.zip`,
        v1Raw: v1, // R2023a
        v1: versionPrune.split('.')[0], // 2023
        v2, // 9.11
        v3, // 0
        version: versionPrune, // 2023.9.14-5
        installParam: getInstallParam(v2),
        ldLibraryPath: getLdLibraryPath(v1Raw, v2),
      };
    }
  }

  const maxVersion = semver.maxSatisfying(Object.keys(versions), '*');

  const upgradeVersions = await Object.values(versions).map(async (v) => {
    let dockerfile = runtime.readDockerfile(`package/${v['v1Raw']}`);
    const currentVersion = runtime.getVersion('MATLAB_RUNTIME_VERSION', dockerfile);
    const latestVersion = v['version'];
    if (semver.gt(latestVersion, currentVersion)) {
      const tags = [];
      tags.push(v['v1']);
      tags.push(latestVersion);

      if (latestVersion == maxVersion) {
        tags.push('latest');
      }

      dockerfile = runtime.replaceVariable('MATLAB_RUNTIME_VERSION', latestVersion, dockerfile);
      dockerfile = runtime.replaceVariable(
        'MATLAB_RUNTIME_INSTALL_PARAMS',
        versions[latestVersion].installParam,
        dockerfile
      );
      dockerfile = runtime.replaceVariable('MATLAB_RUNTIME_DOWNLOAD_URL', versions[latestVersion].url, dockerfile);
      dockerfile = runtime.replaceVariable('LD_LIBRARY_PATH', versions[latestVersion].ldLibraryPath, dockerfile);
      await runtime.uploadFileAndCreatePullRequest(package, latestVersion, {
        [`package/${v['v1Raw']}/Dockerfile`]: dockerfile,
        [`package/${v['v1Raw']}/tags.yml`]: runtime.dumpImageTags(tags),
      });
      return latestVersion;
    }
  });

  if (upgradeVersions.length > 0) {
    return upgradeVersions;
  }
  return null;
};
