# 一个FNM的Docker镜像

1. 如果没有覆盖默认的`entrypoint`, 可以使用环境变量`REGISTRY`设置镜像地址
2. 如果启动时覆盖了默认的`entrypoint`, 需要使用环境变量`NPM_CONFIG_REGISTRY`或`YARN_REGISTRY`设置镜像地址
