# Containers

这是一个容器镜像仓库，提供多种常用开发工具和运行时环境的轻量级容器镜像。这些镜像旨在为开发、测试和部署提供一致的环境。

## 可用镜像

| 镜像                                                                                                   | 说明                                                      | 状态 |
| :----------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- | :--: |
| [bun](https://github.com/containers-actions/containers/pkgs/container/bun)                             | JavaScript 运行时和包管理器                                |  ✅  |
| [cnpmcore](https://github.com/containers-actions/containers/pkgs/container/cnpmcore)                   | 企业级 npm 包管理服务                                      |  ✅  |
| [fnm](https://github.com/containers-actions/containers/pkgs/container/fnm)                             | 快速 Node.js 版本管理器                                    |  ✅  |
| [kkfileview](https://github.com/containers-actions/containers/pkgs/container/kkfileview)               | 文件在线预览服务                                          |  ✅  |
| [kkfileview-base](https://github.com/containers-actions/containers/pkgs/container/kkfileview-base)     | kkfileview 基础镜像 (已弃用)                               |  ⚠️  |
| [libreoffice-nogui](https://github.com/containers-actions/containers/pkgs/container/libreoffice-nogui) | 无图形界面的 LibreOffice，用于文档处理                      |  ✅  |
| [matlab-runtime](https://github.com/containers-actions/containers/pkgs/container/matlab-runtime)       | MATLAB 运行时环境 (已归档)                                 |  ⚠️  |
| [nvm](https://github.com/containers-actions/containers/pkgs/container/nvm)                             | Node.js 版本管理器                                         |  ✅  |
| [subversion](https://github.com/containers-actions/containers/pkgs/container/subversion)               | Subversion (SVN) 版本控制系统                              |  ✅  |

## 使用方法

所有镜像都托管在 GitHub Container Registry 上，可以通过以下方式拉取：

```bash
docker pull ghcr.io/containers-actions/<镜像名>:latest
```

例如：
```bash
docker pull ghcr.io/containers-actions/node:latest
```

## 状态说明

- ✅: 活跃维护中
- ⚠️: 已弃用或归档

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这些镜像。
