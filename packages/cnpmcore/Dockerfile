FROM node:22

ENV CNPMCORE_VERSION="v3.66.0" \
    NODE_ENV=production \
    EGG_SERVER_ENV=prod

WORKDIR /opt/cnpmcore

RUN curl -L https://github.com/containers-actions/cnpmcore/archive/refs/tags/${CNPMCORE_VERSION}.tar.gz -o /tmp/cnpmcore.tar.gz && \
    tar xzvf /tmp/cnpmcore.tar.gz --strip-components=1 -C /opt/cnpmcore && \
    rm -rf /tmp/cnpmcore.tar.gz && \
    yarn && \
    yarn tsc && \
    yarn cache clean --force

EXPOSE 7001

CMD ["yarn", "egg-scripts", "start"]
