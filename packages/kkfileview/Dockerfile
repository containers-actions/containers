FROM ghcr.io/containers-actions/libreoffice-nogui

ENV KKFILEVIEW_VERSION="v4.4.0-beta" \
    JAVA_TOOL_OPTIONS="-Xmx512m -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
