<div align="center">
  <img src="./apps/app/icons/128x128.png" width="128" height="128" alt="QueAN Launcher" />
  <h1>QueAN Launcher</h1>
  <p><strong>面向国内网络的 Minecraft Java 版第三方启动器。</strong></p>
</div>

## 这是什么

QueAN Launcher 是一款免费、开源的 Minecraft Java 版第三方启动器，可以在一个客户端里搜索、安装和更新来自 Modrinth 与 CurseForge 的模组、整合包、资源包与光影，并支持实例管理、多种账户认证（微软 / 离线 / 外置登录）与个性化外观。

- 官网：<https://qafaka.cc.cd/>
- 仓库：<https://github.com/gufukry/quean-files>

## 构建 Windows 安装包

本仓库自带 GitHub Actions 工作流 [`.github/workflows/windows-build.yml`](.github/workflows/windows-build.yml)：

1. 打开仓库的 **Actions** 页面，选择 **Build QueAN Windows**
2. 点 **Run workflow**，填入版本号（如 `v1.0.0`）
3. 构建完成后，在当次运行的 **Artifacts** 里下载 `quean-release`

本地构建需要 Node.js 24、pnpm 10、Rust 1.95 以及 MSVC 生成工具：

```powershell
pnpm install
pnpm --filter @modrinth/app build
```

根目录的 `build-release.cmd` 会把「设置版本 → 构建 → 生成更新清单」串成一步。

## 许可

本项目基于 Axolotl Launcher 的代码继续开发。许可证与原始版权声明见 [COPYING.md](COPYING.md)，第三方组件许可见 `third-party/license-list-data`。
