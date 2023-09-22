module.exports = async ({
  constants: { package, path },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getVersion('MATLAB_RUNTIME_VERSION', dockerfile);

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

  const getLdLibraryPath = (version) => {
    const ldLibraryPaths = [];
    ldLibraryPaths.push(`/MATLAB_Runtime/v${version}/runtime/glnxa64`);
    ldLibraryPaths.push(`/MATLAB_Runtime/v${version}/bin/glnxa64`);
    ldLibraryPaths.push(`/MATLAB_Runtime/v${version}/sys/os/glnxa64`);
    ldLibraryPaths.push(`/MATLAB_Runtime/v${version}/extern/bin/glnxa64`);
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
    if (semver.gte(semver.coerce(v2), semver.coerce('9.11'), true)) {
      const v3 = patchVersion[v1];
      const version = `${/(?<v>\d+)/.exec(v1).groups['v']}.${v2}-${v3}`;
      versions[version] = {
        url: `https://ssd.mathworks.com/supportfiles/downloads/${v1}/Release/${v3}/deployment_files/installer/complete/glnxa64/MATLAB_Runtime_${v1}_${
          v3 == '0' ? '' : `Update_${v3}_`
        }glnxa64.zip`,
        v1Raw: v1, // R2023a
        v1: version.split('.')[0], // 2023
        v2, // 9.11
        v3, // 0
        installParam: getInstallParam(v2),
        ldLibraryPath: getLdLibraryPath(v2.replace('.', '')),
      };
    }
  }
  const sortedVersions = semver.rsort(Object.keys(versions));
  let sortedIndex = sortedVersions.indexOf(currentVersion);
  if (sortedIndex == -1) {
    sortedIndex = sortedVersions.length;
  }
  if (sortedIndex != 0) {
    const latestVersion = sortedVersions[sortedIndex - 1];
    dockerfile = runtime.replaceVariable('MATLAB_RUNTIME_VERSION', latestVersion, dockerfile);
    dockerfile = runtime.replaceVariable('MATLAB_RUNTIME_INSTALL_PARAMS', versions[latestVersion].url, dockerfile);
    dockerfile = runtime.replaceVariable('MATLAB_RUNTIME_DOWNLOAD_URL', versions[latestVersion].url, dockerfile);
    dockerfile = runtime.replaceVariable('LD_LIBRARY_PATH', versions[latestVersion].ldLibraryPath, dockerfile);
    await runtime.uploadFileAndCreatePullRequest(package, latestVersion, `${path}/Dockerfile`, dockerfile);
    return latestVersion;
  }
  return null;
};
