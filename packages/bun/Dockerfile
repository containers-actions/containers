FROM debian:trixie-slim

SHELL ["/bin/bash", "-o", "errexit", "-o", "nounset", "-o", "pipefail", "-c"]

ENV BUN_VERSION="v1.4.2" \
    BUN_INSTALL_BIN=/usr/local/bin \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" \
    ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/" \
    SASS_BINARY_SITE="https://npmmirror.com/mirrors/node-sass" \
    PYTHON_MIRROR="https://npmmirror.com/mirrors/python" \
    PHANTOMJS_CDNURL="https://npmmirror.com/mirrors/phantomjs" \
    NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

COPY rootfs /

RUN ARCH="$(case $(uname -m) in x86_64) echo "x64";; aarch64) echo "aarch64";; *) echo "unknown";; esac)" && \
    apt-get update && \
    apt-get install -y --no-install-recommends unzip git curl ca-certificates && \
    rm -rf /var/lib/apt/lists && \
    curl -L https://github.com/oven-sh/bun/releases/download/bun-${BUN_VERSION}/bun-linux-${ARCH}.zip -o /tmp/bun-linux-${ARCH}.zip && \
    unzip /tmp/bun-linux-${ARCH}.zip -d /tmp/ && \
    cp /tmp/bun-linux-${ARCH}/bun /usr/local/bin/bun && \
    rm -rf /tmp/bun-* && \
    chmod 755 /usr/local/bin/bun

ENTRYPOINT ["/opt/scripts/docker-entrypoint.sh"]
CMD ["/usr/local/bin/bun"]
