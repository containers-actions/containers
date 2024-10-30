FROM bitnami/node:18

ENV CNPMCORE_VERSION="v3.65.0" \
    NODE_ENV=production \
    EGG_SERVER_ENV=prod

WORKDIR /opt/cnpmcore

RUN curl -L https://github.com/cnpm/cnpmcore/archive/refs/tags/${CNPMCORE_VERSION}.tar.gz -o /tmp/cnpmcore.tar.gz && \
    tar xzvf /tmp/cnpmcore.tar.gz --strip-components=1 -C /opt/cnpmcore && \
    rm -rf /tmp/cnpmcore.tar.gz && \
    npm install -g npminstall typescript@5.2.2 && \
    npm run tsc:prod && \
    npminstall && \
    find . -name "*.ts" -type f -exec sh -c 'for file; do { echo "// @ts-nocheck"; cat "$file"; } > "$file.tmp" && mv "$file.tmp" "$file"; done' sh {} + && \
    npm run tsc:prod && \
    npm cache clean --force && \
    rm -rf /root/.npm

EXPOSE 7001

CMD ["npm", "run", "start:foreground"]
