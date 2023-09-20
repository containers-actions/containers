FROM bitnami/os-shell:11

USER root

ENV FNM_VERSION="v1.35.1" \
    FNM_DIR="/fnm" \
    XDG_RUNTIME_DIR="/fnm" \
    FNM_MULTISHELL_PATH=/fnm/multishells \
    FNM_NODE_DIST_MIRROR="https://npmmirror.com/mirrors/node" \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python"

RUN install_packages ca-certificates gnupg unzip git && \
    mkdir $FNM_DIR && \
    curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir $FNM_DIR --release $FNM_VERSION --skip-shell && \
    ln -s /fnm/fnm /usr/local/bin/fnm && \
    # yarn start
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    install_packages yarn && \
    # yarn end
    # pnpm start
    curl -fsSL "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" -o /bin/pnpm; chmod +x /bin/pnpm && \
    # pnpm end
    apt-get --purge autoremove -y gnupg && \
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
