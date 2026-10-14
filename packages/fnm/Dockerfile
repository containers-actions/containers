FROM bitnami/os-shell

USER root

ENV FNM_VERSION="v1.39.0" \
    FNM_DIR="/fnm" \
    XDG_RUNTIME_DIR="/fnm" \
    FNM_MULTISHELL_PATH=/fnm/multishells \
    FNM_NODE_DIST_MIRROR="https://npmmirror.com/mirrors/node" \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python" \
    PHANTOMJS_CDNURL="https://npmmirror.com/mirrors/phantomjs" \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

RUN install_packages ca-certificates unzip git bzip2 && \
    mkdir $FNM_DIR && \
    curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir $FNM_DIR --release $FNM_VERSION --skip-shell && \
    ln -s /fnm/fnm /usr/local/bin/fnm && \
    # yarn start
    # the yarn apt repo no longer works on this base image (no apt-key, apt
    # ignores the third-party source); provision node via fnm and install
    # yarn classic from npm instead
    eval "$(fnm env)" && fnm install --lts && \
    npm install -g yarn@1 && \
    # yarn end
    # pnpm start
    # pnpm releases no longer publish the bare linuxstatic binary; the tarball
    # layout differs per arch (pnpm-linux-x64.tar.gz / pnpm-linux-arm64.tar.gz)
    ARCH=$(case $(uname -m) in x86_64) echo "x64";; aarch64) echo "arm64";; *) echo "unknown";; esac) && \
    curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linux-${ARCH}.tar.gz" | tar -xz -C /tmp pnpm && \
    mv /tmp/pnpm /bin/pnpm && chmod +x /bin/pnpm && \
    # pnpm end
    echo -n $'#!/bin/bash\n\
export PATH="$INSTALL_DIR:$PATH"\n\
eval "$(fnm env)"\n\
' >> /etc/profile && \
    echo -n $'#!/usr/bin/env sh\n\
export PATH="$PATH:$FNM_MULTISHELL_PATH"\n\
if [ -n "$REGISTRY" ]; then\n\
  export NPM_CONFIG_REGISTRY="$REGISTRY"\n\
  export YARN_REGISTRY="$REGISTRY"\n\
fi\n\
exec /bin/sh -l -c "$*"\n\
' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["fnm"]
