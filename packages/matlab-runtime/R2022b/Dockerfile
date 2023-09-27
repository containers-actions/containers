FROM bitnami/java:20

ENV MATLAB_RUNTIME_VERSION="2022.9.13-6" \
    MATLAB_RUNTIME_INSTALL_PARAMS="-agreeToLicense yes -destinationFolder /MATLAB_Runtime" \
    MATLAB_RUNTIME_DOWNLOAD_URL="https://ssd.mathworks.com/supportfiles/downloads/R2022b/Release/6/deployment_files/installer/complete/glnxa64/MATLAB_Runtime_R2022b_Update_6_glnxa64.zip" \
    LD_LIBRARY_PATH="/MATLAB_Runtime/R2022b/runtime/glnxa64:/MATLAB_Runtime/R2022b/bin/glnxa64:/MATLAB_Runtime/R2022b/sys/os/glnxa64:/MATLAB_Runtime/R2022b/extern/bin/glnxa64"

RUN install_packages ca-certificates unzip libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libc6 libcairo2 libcairo-gobject2 libcap2 libcrypt1 libcrypt-dev libcups2 libdbus-1-3 libdrm2 libfontconfig1 libgbm1 libgdk-pixbuf2.0-0 libglib2.0-0 libgomp1 libgstreamer1.0-0 libgstreamer-plugins-base1.0-0 libgtk-3-0 libnspr4 libnss3 libodbc1 libpam0g libpango-1.0-0 libpangocairo-1.0-0 libpangoft2-1.0-0 libpython3.9 libsm6 libsndfile1 libssl1.1 libuuid1 libx11-6 libx11-xcb1 libxcb-dri3-0 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxft2 libxi6 libxinerama1 libxrandr2 libxrender1 libxt6 libxtst6 libxxf86vm1 linux-libc-dev locales locales-all make net-tools procps sudo unzip wget zlib1g && \
mkdir -p /tmp/MATLAB_Runtime_Install /MATLAB_Runtime && \
curl -L ${MATLAB_RUNTIME_DOWNLOAD_URL} -o /tmp/MATLAB_Runtime_Install.zip && \
unzip -d /tmp/MATLAB_Runtime_Install /tmp/MATLAB_Runtime_Install.zip && \
/tmp/MATLAB_Runtime_Install/install ${MATLAB_RUNTIME_INSTALL_PARAMS} && \
rm -rf /tmp/MATLAB_Runtime_Install*

WORKDIR /application

ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]
