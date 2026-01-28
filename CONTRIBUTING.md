# Contributing to Containers

This document explains how to add new container images to this repository.

## Adding a New Package

To add a new package, create a directory under `packages/` with the following files:

```
packages/<package-name>/
├── Dockerfile
├── tags.yml
├── update.task.js
├── README.md (optional)
└── rootfs/ (optional)
```

### Dockerfile Template

```dockerfile
FROM bitnami/os-shell

USER root

ENV PACKAGE_NAME_VERSION="1.0.0" \
    # Add any other environment variables here
    PACKAGE_INSTALL_PATH=/usr/local/bin

# Copy any custom files
COPY rootfs /

RUN install_packages <list-of-packages> && \
    # Installation commands here
    # Clean up temporary files

ENTRYPOINT ["/opt/scripts/docker-entrypoint.sh"]
CMD ["/usr/local/bin/package-executable"]
```

### tags.yml Format

```yaml
rolling-tags:
  - 1.0.0
  - latest
```

### update.task.js Template

```javascript
module.exports = async ({
  constants: { package },
  scripts: { github, context, core, glob, io, exec, fetch, require },
  runtime,
}) => {
  const semver = require('semver');
  let dockerfile = runtime.readDockerfile(package);
  const currentVersion = runtime.getDockerfileEnvVersion('PACKAGE_NAME_VERSION', dockerfile);
  const latestVersion = await runtime.getLatestReleaseTagName({ owner: 'owner', repo: 'repo' });
  if (semver.lt(currentVersion, latestVersion)) {
    dockerfile = runtime.replaceVariable('PACKAGE_NAME_VERSION', latestVersion, dockerfile);
    await runtime.updateFileAndCreatePullRequest(package, latestVersion, {
      Dockerfile: dockerfile,
      'tags.yml': runtime.dumpImageTags([semver.clean(latestVersion, { loose: true }), 'latest']),
    });
    return latestVersion;
  }
  return null;
};
```