FROM maven:3-eclipse-temurin-8 as builder

ENV KKFILEVIEW_VERSION="v4.4.0-beta"

WORKDIR /workspace

RUN install_packages git && \
git clone -b $KKFILEVIEW_VERSION --depth=1 https://github.com/kekingcn/kkFileView.git && \
cd /workspace/kkFileView && \
mvn clean package -DskipTests -Dassembly.skipAssembly=true && \
mkdir /workspace/buildDir && \
cd /workspace/buildDir && \
java -Djarmode=layertools -jar /workspace/kkFileView/server/target/kkFileView-*.jar extract

FROM ghcr.io/containers-actions/libreoffice-nogui

ENV KKFILEVIEW_VERSION="v4.4.0-beta" \
    KKFILEVIEW_BIN_FOLDER="/opt/KKFileView/bin" \
    JAVA_TOOL_OPTIONS="-Xmx512m -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

WORKDIR /opt

COPY --from=builder /workspace/buildDir/dependencies .
COPY --from=builder /workspace/buildDir/spring-boot-loader .
COPY --from=builder /workspace/buildDir/snapshot-dependencies .
COPY --from=builder /workspace/buildDir/application .
COPY --from=builder /workspace/buildDir/application/BOOT-INF/classes/application.properties ./config/

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
