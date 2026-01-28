# Containers

A collection of optimized container images for various development tools and applications.

## Available Images

| 镜像                                                                                                   |              说明              | 状态 |
| :----------------------------------------------------------------------------------------------------- | :----------------------------: | :--: |
| [bun](https://github.com/containers-actions/containers/pkgs/container/bun)                             | Fast JavaScript runtime        |  ✅  |
| [cnpmcore](https://github.com/containers-actions/containers/pkgs/container/cnpmcore)                   | [README.md](packages/cnpmcore) |  ✅  |
| [fnm](https://github.com/containers-actions/containers/pkgs/container/fnm)                             | Fast Node Manager              |  ✅  |
| [kkfileview](https://github.com/containers-actions/containers/pkgs/container/kkfileview)               | File online preview solution   |  ✅  |
| [kkfileview-base](https://github.com/containers-actions/containers/pkgs/container/kkfileview-base)     |          [Deprecated]          |  ⚠️  |
| [libreoffice-nogui](https://github.com/containers-actions/containers/pkgs/container/libreoffice-nogui) | Headless LibreOffice           |  ✅  |
| [matlab-runtime](https://github.com/containers-actions/containers/pkgs/container/matlab-runtime)       |           [Archive]            |  ⚠️  |
| [nvm](https://github.com/containers-actions/containers/pkgs/container/nvm)                             | Node Version Manager           |  ✅  |
| [subversion](https://github.com/containers-actions/containers/pkgs/container/subversion)               | Subversion client              |  ✅  |

## Quick Start

### Using Pre-built Images

```bash
# Pull and run any image
docker run --rm -it ghcr.io/containers-actions/bun:latest bun --version
docker run --rm -it ghcr.io/containers-actions/fnm:latest fnm --version
```

### Building Locally

Using the Makefile:

```bash
# Build all images
make build-all

# Build specific image
make build-bun

# Test an image
make test-bun
```

### Development

For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md).

For detailed documentation on each package, visit our [documentation](docs/index.md).
