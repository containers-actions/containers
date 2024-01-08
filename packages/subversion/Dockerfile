FROM bitnami/minideb:bookworm

ENV SUBVERSION_VERSION=""

RUN install_packages subversion=${SUBVERSION_VERSION}

ENTRYPOINT ["svn"]
