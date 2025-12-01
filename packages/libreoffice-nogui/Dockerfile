FROM bitnami/os-shell

USER root

ENV LANG=zh_CN.UTF-8 \
    LC_ALL=zh_CN.UTF-8 \
    LIBREOFFICE_VERSION="4:7.4.7-1+deb12u9" \
    JAVA_TOOL_OPTIONS="-Xmx512m -Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

COPY fonts/* /usr/share/fonts/chinese/

RUN export DEBIAN_FRONTEND=noninteractive && \
    # 国内构建可放开
    # sed -i 's/deb.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list && \
    # sed -i 's/security.debian.org\//mirrors.cloud.tencent.com\/debian-security/g' /etc/apt/sources.list && \
    sed -i 's/main/main non-free contrib/g' /etc/apt/sources.list && \
    install_packages ca-certificates xfonts-utils fontconfig ttf-mscorefonts-installer ttf-wqy-microhei ttf-wqy-zenhei xfonts-wqy fonts-dejavu libreoffice-nogui temurin-8-jdk && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    localedef -c -f UTF-8 -i zh_CN zh_CN.UTF-8 && \
    echo 'zh_CN.UTF-8 UTF-8' >> /etc/locale.gen && locale-gen && \
    mkfontscale && mkfontdir && fc-cache -fv

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
