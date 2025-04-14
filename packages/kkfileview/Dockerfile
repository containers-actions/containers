FROM maven:3-eclipse-temurin-8 AS builder

ENV KKFILEVIEW_VERSION="v4.4.0"

WORKDIR /workspace

RUN ARCH=$(case $(uname -m) in x86_64) echo "amd64";; aarch64) echo "arm64";; *) echo "unknown";; esac) && \
git clone -b $KKFILEVIEW_VERSION --depth=1 https://github.com/kekingcn/kkFileView.git && \
cd /workspace/kkFileView && \
mvn clean package -DskipTests -Dassembly.skipAssembly=true && \
mkdir /workspace/buildDir && \
cd /workspace/buildDir && \
java -Djarmode=layertools -jar /workspace/kkFileView/server/target/kkFileView-*.jar extract && \
# remove FileController IndexController
ls -al /workspace/buildDir/application/BOOT-INF/classes/cn/keking/web/controller && \
rm -rf /workspace/buildDir/application/BOOT-INF/classes/cn/keking/web/controller/IndexController.class && \
rm -rf /workspace/buildDir/application/BOOT-INF/classes/cn/keking/web/controller/FileController.class && \
ls -al /workspace/buildDir/application/BOOT-INF/classes/cn/keking/web/controller && \
# remove sourcemap
find /workspace/buildDir -type f -name "*.js.map" -exec rm -f {} \; && \
exit 1 && \
curl -kL https://repo1.maven.org/maven2/net/sf/sevenzipjbinding/sevenzipjbinding-linux-$ARCH/16.02-2.01/sevenzipjbinding-linux-$ARCH-16.02-2.01.jar -o dependencies/BOOT-INF/lib/sevenzipjbinding-all-platforms-16.02-2.01.jar

FROM ghcr.io/containers-actions/libreoffice-nogui

ENV KKFILEVIEW_VERSION="v4.4.0" \
    KKFILEVIEW_BIN_FOLDER="/opt/KKFileView/bin" \
    JAVA_TOOL_OPTIONS="-Xmx512m -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -Dsun.jnu.encoding=UTF-8 -Dfile.encoding=UTF-8 -Duser.timezone=Asia/Shanghai"

WORKDIR /opt/KKFileView

COPY --from=builder /workspace/buildDir/dependencies .
COPY --from=builder /workspace/buildDir/spring-boot-loader .
COPY --from=builder /workspace/buildDir/snapshot-dependencies .
COPY --from=builder /workspace/buildDir/application .
COPY --from=builder /workspace/buildDir/application/BOOT-INF/classes/application.properties ./config/

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
