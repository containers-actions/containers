FROM bitnami/minideb:bookworm

ENV SUBVERSION_VERSION="Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
Get:2 http://deb.debian.org/debian bookworm-updates InRelease [55.4 kB]
Get:3 http://deb.debian.org/debian-security bookworm-security InRelease [48.0 kB]
Get:4 http://deb.debian.org/debian bookworm/main amd64 Packages [12.1 MB]
Get:5 http://deb.debian.org/debian bookworm-updates/main amd64 Packages [2468 B]
Get:6 http://deb.debian.org/debian-security bookworm-security/main amd64 Packages [188 kB]
Fetched 12.5 MB in 1s (16.1 MB/s)
Reading package lists...
Building dependency tree...
All packages are up to date.
1.14.2-4+b2"

RUN install_packages subversion=${SUBVERSION_VERSION}

ENTRYPOINT ["svn"]
