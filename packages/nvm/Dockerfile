FROM bitnami/os-shell

USER root

ENV NVM_VERSION="v0.40.3" \
    NVM_NODEJS_ORG_MIRROR="https://npmmirror.com/mirrors/node" \
    NVM_IOJS_ORG_MIRROR="https://npmmirror.com/mirrors/iojs" \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python" \
    PHANTOMJS_CDNURL="https://npmmirror.com/mirrors/phantomjs" \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

RUN install_packages ca-certificates gnupg unzip git bzip2 && \
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash && \
    # yarn start
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    install_packages yarn && \
    # yarn end
    # pnpm start
    # pnpm releases no longer publish the bare linuxstatic binary; the tarball
    # layout differs per arch (pnpm-linux-x64.tar.gz / pnpm-linux-arm64.tar.gz)
    ARCH=$(case $(uname -m) in x86_64) echo "x64";; aarch64) echo "arm64";; *) echo "unknown";; esac) && \
    curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linux-${ARCH}.tar.gz" | tar -xz -C /tmp pnpm && \
    mv /tmp/pnpm /bin/pnpm && chmod +x /bin/pnpm && \
    # pnpm end
    apt-get --purge autoremove -y gnupg && \
    ln -sf $HOME/.nvm/nvm.sh /etc/profile.d/nvm.sh && \
    echo -n $'#!/bin/bash\n\
if [ -n "$REGISTRY" ]; then\n\
  export NPM_CONFIG_REGISTRY="$REGISTRY"\n\
  export YARN_REGISTRY="$REGISTRY"\n\
fi\n\
exec /bin/sh -l -c "$*"\n\
' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nvm"]
