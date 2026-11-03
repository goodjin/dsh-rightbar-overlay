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

## 安装

```bash
pnpm add @goodjin2/dsh-rightbar-overlay
```

## 使用

在 DSH 配置中启用插件：

```typescript
import rightbarOverlay from '@goodjin2/dsh-rightbar-overlay/client'

export default {
  plugins: [rightbarOverlay],
}
```

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

本插件从 `@goodjin2/threadharbor` 迁移出来（2026-11-02），作为独立插件。原功能代码在 `threadharbor/src/rightbar-overlay.ts`。

## 许可

MIT
