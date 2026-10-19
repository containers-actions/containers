FROM debian:trixie

SHELL ["/bin/bash", "-o", "errexit", "-o", "nounset", "-o", "pipefail", "-c"]

ENV SUBVERSION_VERSION="1.14.5-2" \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8

RUN apt-get update && \
    apt-get install -y --no-install-recommends subversion=${SUBVERSION_VERSION} && \
    apt-get clean && rm -rf /var/lib/apt/lists

ENTRYPOINT ["svn"]
