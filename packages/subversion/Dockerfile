FROM bitnami/minideb:bookworm

ENV SUBVERSION_VERSION="1.14.5-3"

RUN install_packages subversion=${SUBVERSION_VERSION}

ENTRYPOINT ["svn"]
