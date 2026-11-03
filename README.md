# @goodjin2/dsh-rightbar-overlay

DSH plugin: Right sidebar overlay layout - changes right panel from push to overlay mode.

## 功能

将 DSH 的右侧栏（终端/文件/预览/浏览器）从默认的「推挤」模式改为「覆盖」模式：

- **推挤模式**（默认）：右侧栏展开时，会话区宽度被压缩，左右分成两栏
- **覆盖模式**（本插件）：右侧栏展开时，会话区保持全宽，右侧栏浮在会话区上方

## 工作原理

- 桌面宽度（>1023px）且右侧栏推挤展开时，用 CSS 网格模板把右侧栏轨道压回 0
- 右侧栏面板本来就被绝对定位钉在布局帧右缘，轨道归零后自然叠在会话区上方
- 补一道浮层阴影，视觉层次更清晰
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
