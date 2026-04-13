FROM debian:trixie

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    LIBREOFFICE_VERSION="4:7.4.7-1+deb12u9" \
    JAVA_TOOL_OPTIONS="-Xmx512m -Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

COPY fonts/* /usr/share/fonts/chinese/

RUN export DEBIAN_FRONTEND=noninteractive && \
    echo "deb http://deb.debian.org/debian bookworm main contrib non-free non-free-firmware" > /etc/apt/sources.list && \
    apt update && \
    apt install --no-install-recommends -y wget apt-transport-https gpg ca-certificates xfonts-utils fontconfig fonts-noto-cjk fonts-liberation fonts-dejavu libreoffice-nogui && \
    wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | gpg --dearmor | tee /etc/apt/trusted.gpg.d/adoptium.gpg > /dev/null && \
    echo "deb https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list && \
    apt update && \
    apt install --no-install-recommends -y temurin-21-jdk && \
    rm -rf /var/lib/apt/lists/* && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    mkfontscale && mkfontdir && fc-cache -fv

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
