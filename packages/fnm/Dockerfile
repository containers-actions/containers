FROM debian:trixie-slim

SHELL ["/bin/bash", "-o", "errexit", "-o", "nounset", "-o", "pipefail", "-c"]

ENV FNM_VERSION="v1.39.0" \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    FNM_DIR="/fnm" \
    XDG_RUNTIME_DIR="/fnm" \
    FNM_MULTISHELL_PATH=/fnm/multishells \
    FNM_NODE_DIST_MIRROR="https://npmmirror.com/mirrors/node" \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python" \
    PHANTOMJS_CDNURL="https://npmmirror.com/mirrors/phantomjs" \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt \
    PATH="/fnm/aliases/default/bin:${PATH}"

RUN export DEBIAN_FRONTEND=noninteractive && \
    apt-get -o Acquire::Retries=3 update -qq && \
    apt-get -o Acquire::Retries=3 install -y --no-install-recommends ca-certificates curl && \
    curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg -o /etc/apt/trusted.gpg.d/yarn.asc && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
    apt-get -o Acquire::Retries=3 update -qq && \
    apt-get -o Acquire::Retries=3 install -y --no-install-recommends unzip git bzip2 yarn && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir $FNM_DIR && \
    curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir $FNM_DIR --release $FNM_VERSION --skip-shell && \
    ln -s /fnm/fnm /usr/local/bin/fnm && \
    # pnpm start
    # pnpm releases no longer publish the bare linuxstatic binary; the tarball
    # layout differs per arch (pnpm-linux-x64.tar.gz / pnpm-linux-arm64.tar.gz)
    ARCH=$(case $(uname -m) in x86_64) echo "x64";; aarch64) echo "arm64";; *) echo "unknown";; esac) && \
    curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linux-${ARCH}.tar.gz" | tar -xz -C /tmp pnpm && \
    mv /tmp/pnpm /bin/pnpm && chmod +x /bin/pnpm && \
    # pnpm end
    # /etc/profile resets PATH for login shells, and the entrypoint runs the
    # command via `sh -l`, so the image-level PATH is overwritten. profile.d
    # is sourced after that reset, which is where the node path must go.
    printf '%s\n' 'export PATH="/fnm/aliases/default/bin:$PATH"' > /etc/profile.d/fnm.sh && \
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
