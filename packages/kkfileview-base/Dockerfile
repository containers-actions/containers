FROM bitnami/java:1.8

ENV LANG=zh_CN.UTF-8 \
    LC_ALL=zh_CN.UTF-8 \
    LIBRE_OFFICE_VERSION="24.2.4" \
    KKFILEVIEW_BIN_FOLDER="/opt/KKFileView" \
    KK_OFFICE_HOME="/opt/libreoffice24.2" \
    JAVA_TOOL_OPTIONS="-Xmx512m -Xmx2048m -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

WORKDIR /opt/KKFileView

COPY fonts/* /usr/share/fonts/chinese/

RUN export DEBIAN_FRONTEND=noninteractive && \
    # 国内构建可放开
    # sed -i 's/deb.debian.org/mirrors.cloud.tencent.com/g' /etc/apt/sources.list && \
    # sed -i 's/security.debian.org\//mirrors.cloud.tencent.com\/debian-security/g' /etc/apt/sources.list && \
    sed -i 's/main/main non-free contrib/g' /etc/apt/sources.list && \
    install_packages ca-certificates fontconfig ttf-mscorefonts-installer ttf-wqy-microhei ttf-wqy-zenhei xfonts-wqy \
    libxinerama1 libnss3 libglib2.0-0 libcups2 libcairo2 libdbus-1-3 libsm6  && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    localedef -c -f UTF-8 -i zh_CN zh_CN.UTF-8 && \
    echo 'zh_CN.UTF-8 UTF-8' >> /etc/locale.gen && locale-gen && \
    mkfontscale && mkfontdir && fc-cache -fv && \
    # curl -L https://mirrors.cloud.tencent.com/libreoffice/libreoffice/stable/${LIBRE_OFFICE_VERSION}/deb/x86_64/LibreOffice_${LIBRE_OFFICE_VERSION}_Linux_x86-64_deb.tar.gz -o /opt/libreoffice_deb.tar.gz && \
    curl -L https://download.documentfoundation.org/libreoffice/stable/${LIBRE_OFFICE_VERSION}/deb/x86_64/LibreOffice_${LIBRE_OFFICE_VERSION}_Linux_x86-64_deb.tar.gz -o /opt/libreoffice_deb.tar.gz && \
    tar -zxf /opt/libreoffice_deb.tar.gz -C /opt && \
    rm -rf /opt/libreoffice_deb.tar.gz && \
    dpkg -i /opt/LibreOffice_*_Linux_x86-64_deb/DEBS/*.deb && \
    rm -rf /opt/LibreOffice_*_Linux_x86-64_deb

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
