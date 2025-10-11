FROM bitnami/os-shell

USER root

ENV BUN_VERSION="v1.3.0" \
    BUN_INSTALL_BIN=/usr/local/bin \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python" \
    PHANTOMJS_CDNURL="https://npmmirror.com/mirrors/phantomjs" \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

COPY rootfs /

RUN ARCH="$(if [ "$OS_ARCH" = "amd64" ]; then echo "x64"; elif [ "$OS_ARCH" = "arm64" ]; then echo "aarch64"; else echo "unknown"; fi)" && \
    install_packages unzip git && \
    curl -L https://github.com/oven-sh/bun/releases/download/bun-${BUN_VERSION}/bun-linux-${ARCH}.zip -o /tmp/bun-linux-${ARCH}.zip && \
    unzip /tmp/bun-linux-${ARCH}.zip -d /tmp/ && \
    cp /tmp/bun-linux-${ARCH}/bun /usr/local/bin/bun && \
    rm -rf /tmp/bun-* && \
    chmod 755 /usr/local/bin/bun

ENTRYPOINT ["/opt/scripts/docker-entrypoint.sh"]
CMD ["/usr/local/bin/bun"]
