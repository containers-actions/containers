FROM debian:trixie-slim

SHELL ["/bin/bash", "-o", "errexit", "-o", "nounset", "-o", "pipefail", "-c"]

ENV NVM_VERSION="v0.40.8" \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    NVM_NODEJS_ORG_MIRROR="https://npmmirror.com/mirrors/node" \
    NVM_IOJS_ORG_MIRROR="https://npmmirror.com/mirrors/iojs" \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python" \
    PHANTOMJS_CDNURL="https://npmmirror.com/mirrors/phantomjs" \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash && \
    # yarn start
    # yarn's apt repo is distro-agnostic (Suite: stable); store the key directly
    # in trusted.gpg.d since apt-key is deprecated. A system-level install keeps
    # yarn available no matter which node version nvm switches to.
    curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg -o /etc/apt/trusted.gpg.d/yarn.asc && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates curl unzip git bzip2 fonts-noto-cjk fontconfig yarn && \
    rm -rf /var/lib/apt/lists && \
    # yarn end
    export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && \
    nvm install --lts && \
    # pnpm start
    # pnpm releases no longer publish the bare linuxstatic binary; the tarball
    # layout differs per arch (pnpm-linux-x64.tar.gz / pnpm-linux-arm64.tar.gz)
    ARCH=$(case $(uname -m) in x86_64) echo "x64";; aarch64) echo "arm64";; *) echo "unknown";; esac) && \
    curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linux-${ARCH}.tar.gz" | tar -xz -C /tmp pnpm && \
    mv /tmp/pnpm /bin/pnpm && chmod +x /bin/pnpm && \
    # pnpm end
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
