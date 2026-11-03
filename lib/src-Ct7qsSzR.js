"use client"
//#region src/index.ts
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
/** 与 DSH 的 SIDEBAR_AUTO_COLLAPSE 对齐：到这个宽度以下侧栏才浮起来。 */
const MOBILE_MAX_WIDTH = 1023;
/** 实验位开关的存储键；只有显式 'off' 才停用，缺省启用。 */
const RIGHTBAR_OVERLAY_KEY = "rightbarOverlay.enabled";
/** frame 上的标记，覆盖样式只认这个属性。 */
const RIGHTBAR_FRAME_ATTR = "data-rightbar-overlay";
/** 侧栏列轨道宽度的镜像变量；frame 内联样式每次重写后更新。 */
const SIDEBAR_TRACK_VAR = "--rightbar-sidebar-track";
/** 注入样式的元素 id；重复启动（HMR）只插一份。 */
const STYLE_ID = "rightbar-overlay-style";
const OVERLAY_CSS = `
@media (min-width: ${MOBILE_MAX_WIDTH + 1}px) {
  [${RIGHTBAR_FRAME_ATTR}]:not([data-rightbar-collapsed]):not([data-rightbar-fullscreen]) {
    grid-template-columns: var(${SIDEBAR_TRACK_VAR}, 280px) minmax(0, 1fr) 0px !important;
  }
  [${RIGHTBAR_FRAME_ATTR}]:not([data-rightbar-collapsed]):not([data-rightbar-fullscreen]) [data-sidebar-right-panel='push'] {
    box-shadow: -12px 0 32px rgba(0, 0, 0, 0.22);
  }
}
`;
/**
* 装上右侧栏覆盖布局。
* @param deps - 页面面；SSR/没有 document 时返回一个空壳。
* @returns dispose 撤样式、标记、镜像与观察者。
*/
function startRightbarOverlay(deps = {}) {
	const doc = deps.document ?? (typeof document === "undefined" ? void 0 : document);
	const win = deps.window ?? doc?.defaultView ?? (typeof window === "undefined" ? void 0 : window);
	if (doc === void 0 || win === void 0) return { dispose: () => {} };
	let disabled = false;
	try {
		disabled = win.localStorage.getItem(RIGHTBAR_OVERLAY_KEY) === "off";
	} catch {}
	if (disabled) return { dispose: () => {} };
	const log = deps.log ?? (() => {});
	let frame;
	let disposed = false;
	if (doc.getElementById(STYLE_ID) === null) {
		const style = doc.createElement("style");
		style.id = STYLE_ID;
		style.textContent = OVERLAY_CSS;
		doc.head.appendChild(style);
	}
	/** 把 frame 内联网格模板的第一条轨道（侧栏列）镜像进变量；读不出就撤掉。 */
	const mirrorSidebarTrack = () => {
		if (frame === void 0) return;
		const first = frame.style.gridTemplateColumns.trim().split(/\s+/)[0] ?? "";
		if (/^\d+(?:\.\d+)?px$/.test(first)) frame.style.setProperty(SIDEBAR_TRACK_VAR, first);
		else frame.style.removeProperty(SIDEBAR_TRACK_VAR);
	};
	/** 找到壳并打好标记；返回当下的 frame（没有就 undefined）。 */
	const ensureTagged = () => {
		if (frame !== void 0 && frame.isConnected && frame.hasAttribute(RIGHTBAR_FRAME_ATTR)) return frame;
		const candidate = doc.querySelector("[data-rightbar-col]")?.parentElement ?? null;
		if (candidate === null) return void 0;
		candidate.setAttribute(RIGHTBAR_FRAME_ATTR, "");
		frame = candidate;
		mirrorSidebarTrack();
		return frame;
	};
	const observer = new MutationObserver((records) => {
		if (disposed) return;
		if (frame === void 0 || !frame.isConnected || !frame.hasAttribute(RIGHTBAR_FRAME_ATTR)) {
			if (ensureTagged() === void 0) log("rightbar overlay: frame not found yet");
			return;
		}
		if (records.some((record) => record.target === frame && record.attributeName === "style")) mirrorSidebarTrack();
	});
	if (doc.body !== null) observer.observe(doc.body, {
		attributes: true,
		attributeFilter: ["style"],
		childList: true,
		subtree: true
	});
	if (ensureTagged() === void 0) log("rightbar overlay: frame not found yet");
	return { dispose: () => {
		disposed = true;
		observer.disconnect();
		doc.getElementById(STYLE_ID)?.remove();
		if (frame !== void 0) {
			frame.removeAttribute(RIGHTBAR_FRAME_ATTR);
			frame.style.removeProperty(SIDEBAR_TRACK_VAR);
		}
	} };
}

//#endregion
export { startRightbarOverlay as t };