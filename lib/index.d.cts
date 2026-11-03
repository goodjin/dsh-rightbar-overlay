//#region src/index.d.ts
/**
 * 右侧栏覆盖布局：DSH 的右侧栏（终端/文件/预览/浏览器）默认「推挤」呈现——
 * 展开时布局帧把第三条网格轨道用剩余空间撑开（轨道定宽上限，与内容无关），
 * 会话区让位、左右分成两栏。
 *
 * 这个模块只补这一处，把推挤改成「覆盖」：
 * - 桌面宽度（>1023，与 mobile-layout 的抽屉模式分界）且右侧栏推挤展开时，
 *   用一条 !important 的网格模板把第三条轨道压回 0、会话区占满剩余宽度；
 * - 右侧栏面板本来就被绝对定位钉在布局帧右缘、宽度来自自己的内联样式，
 *   轨道归零后它自然叠在会话区上方，补一道浮层影子即可；
 * - 第一条轨道（侧栏列）是动态值，镜像进一个 CSS 变量，React 每次重写
 *   frame 的内联样式就跟一次；
 * - 收起（data-rightbar-collapsed）与全屏（data-rightbar-fullscreen）两个
 *   状态由 DSH 布局服务自己维护，样式用 :not() 守卫，一概不碰；
 * - localStorage `rightbarOverlay.enabled` = 'off' 时整个模块不装，
 *   回到官方原样（实验位开关）。
 *
 * 标记只认 DSH 壳自己的稳定属性（data-rightbar-col / data-rightbar-collapsed /
 * data-rightbar-fullscreen / 面板的 data-sidebar-right-panel），不依赖压缩类名；
 * DSH 换皮肤不会把这里悄悄弄坏。
 *
 * 从 @goodjin2/threadharbor 迁移出来（2026-11-02），作为独立插件。
 */
/** 这个模块要的页面面：缺省用真实 document/window，测试塞假件。 */
type RightbarOverlayDeps = {
  document?: Document;
  window?: Window;
  /** 找不到壳时说一句；缺省吞掉。 */
  log?(message: string): void;
};
type RightbarOverlay = {
  dispose(): void;
};
/**
 * 装上右侧栏覆盖布局。
 * @param deps - 页面面；SSR/没有 document 时返回一个空壳。
 * @returns dispose 撤样式、标记、镜像与观察者。
 */
declare function startRightbarOverlay(deps?: RightbarOverlayDeps): RightbarOverlay;
//#endregion
export { RightbarOverlay, RightbarOverlayDeps, startRightbarOverlay };