# @goodjin2/dsh-rightbar-overlay

DSH plugin: the right sidebar takes over the conversation area instead of squeezing it.

## 功能

将 DSH 的右侧栏（终端/文件/预览/浏览器）从默认的「推挤」模式改为「接管会话区」：

- **推挤模式**（默认）：右侧栏展开时，会话区宽度被压缩，左右分成两栏
- **接管模式**（本插件）：右侧栏展开时，面板铺满整个会话区（左缘对齐会话列左缘、
  右缘是窗口右缘），会话区在它背后

## 工作原理

- 桌面宽度（>1023px）且右侧栏推挤展开时，用 CSS 网格模板把右侧栏轨道压回 0，
  会话区保持整宽
- 右侧栏列是面板的定位上下文（`position: relative`）；把它撤成 `static`，面板就
  改为相对布局帧定位——左缘落到会话列左缘、右缘是帧右缘、宽度由两端拉满
- 侧栏列轨道宽度是动态值，镜像进一个 CSS 变量，网格模板与面板左缘都用它
- 收起（`data-rightbar-collapsed`）与全屏（`data-rightbar-fullscreen`）状态不受影响

## 安装与挂载

```bash
pnpm add @goodjin2/dsh-rightbar-overlay
```

在 profile 的 `dsh.profile.bundles` 里加上 `@goodjin2/dsh-rightbar-overlay` 即可。
本包自带 `cordis.patch.yml`（`dsh.bundle.patch`），里面是一条**裸包名**的装载行：

```yaml
- insert:
    - id: rightbar-overlay-client
      name: '@goodjin2/dsh-rightbar-overlay'
```

两处不能写错，否则装上等于没装（而且不报错）：

- **行名必须是裸包名。** DSH 只把 name 恰好等于包名的 Loader 行认成浏览器行
  （`ClientModuleRegistry.resolveMeta` 经 `locatePkgJson` 解析）；带 `/client`
  子路径的名字会被判掉，那行退化成在 node 里 import 浏览器产物，右侧栏回到官方
  的「推挤」布局。
- **package.json 必须同时声明 `dsh.bundle.patch` 与 `dsh.client.platform = "web"`。**
  前者缺失时 profile 会直接跳过整个 bundle（app-boot 读 profile 时的跳过分支）；
  后者缺失时客户端模块注册表不把这行认成浏览器行。

`exports["./client"]` 也要写成宿主认的形状：字符串，或带字符串 `default` 的对象
（`clientExportOf` 只认这两种，只有 `import`/`require` 会被当场判错）。

### 产物形状：单文件 CJS 工厂（这一条最容易踩）

页面把 `exports["./client"]` 指向的那个文件当**普通脚本**加载，模块表靠
`window.__ModuleLoader__.load({ id, factory })` 收它。所以那个文件必须是
「单文件 CJS 工厂」，外面套一层 load，factory 里把 `apply`/`name`/`inject`
挂到 `module.exports` 上——与 DSH 自带的客户端插件、以及 `dsh-chat-area` /
`dsh-acp-agent` 的产物同款。

产物若是普通 ESM 模块（顶层 `import`/`export`），页面直接报语法错误，浏览器
半边整块不注册；宿主那一行随后被判成导入失败，包**根本不会进启动图**，
界面上一个字都没有（2026-11-03 现场：这个包就是这么"装上了却不生效"的）。

包的 `.` 入口（宿主进程 import 的那个）要指向 `src/entry.ts`——一个空的
`apply`，浏览器代码不许混进宿主进程。

浏览器半边的产物是 `lib/client.js`，随库提交（`npm run build` 重建）。

## 开关

插件默认启用。如需禁用，在浏览器 localStorage 中设置：

```javascript
localStorage.setItem('rightbarOverlay.enabled', 'off')
```

刷新页面后，右侧栏恢复默认的推挤模式。

## 技术细节

- 标记只认 DSH 壳的稳定属性（`data-rightbar-col` / `data-rightbar-collapsed` / `data-rightbar-fullscreen`），不依赖压缩类名
- 使用 MutationObserver 监听 frame 样式变化，同步侧栏列轨道宽度到 CSS 变量
- SSR/无 document 环境下返回空壳，不报错

## 从 threadharbor 迁移

本插件从 `@goodjin2/threadharbor` 迁移出来（2026-11-02），作为独立插件。
threadharbor 里的那份已在 2026-11-03 删除，避免两份覆盖层同时生效
（两者都用 `!important` 网格模板，同时装会互相抢）。

开关的存储键也一并换了：老版是 `threadharbor.rightbarOverlay`，本插件是
`rightbarOverlay.enabled`。以前设过 off 的机器要重新设一次。

## 许可

MIT
