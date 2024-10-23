FROM bitnami/minideb:bookworm

ENV SUBVERSION_VERSION="1.14.2-4+b1"

RUN install_packages subversion=${SUBVERSION_VERSION}

ENTRYPOINT ["svn"]
