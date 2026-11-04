window.__ModuleLoader__.load({id:`@goodjin2/dsh-rightbar-overlay`,factory:e=>{var t={exports:{}},n=t.exports;let r=`data-rightbar-overlay`,i=`--rightbar-sidebar-track`,a=`rightbar-overlay-style`,o=`
@media (min-width: 1024px) {
  [${r}]:not([data-rightbar-collapsed]):not([data-rightbar-fullscreen]) {
    grid-template-columns: var(${i}, 280px) minmax(0, 1fr) 0px !important;
  }
  /* 右侧栏列是面板的定位上下文（position: relative）。撤掉它，面板就改为相对
     布局帧定位——左缘才能落到会话列左缘，而不是被钉在 0 宽的列里。 */
  [${r}]:not([data-rightbar-collapsed]):not([data-rightbar-fullscreen]) [data-rightbar-col] {
    position: static !important;
  }
  /* 接管整个会话区：左缘 = 会话列左缘，右缘 = 帧右缘，宽度由两端拉满。
     面板自己的内联宽度（它的宿主给的请求宽）在这里被覆盖。 */
  [${r}]:not([data-rightbar-collapsed]):not([data-rightbar-fullscreen]) [data-sidebar-right-panel='push'] {
    left: var(${i}, 280px) !important;
    right: 0 !important;
    width: auto !important;
    /* 不再是浮在会话区上面的一层：没有浮层影子。 */
    box-shadow: none !important;
  }
}
`;function s(e={}){let t=e.document??(typeof document>`u`?void 0:document),n=e.window??t?.defaultView??(typeof window>`u`?void 0:window);if(t===void 0||n===void 0)return{dispose:()=>{}};let s=!1;try{s=n.localStorage.getItem(`rightbarOverlay.enabled`)===`off`}catch{}if(s)return{dispose:()=>{}};let c=e.log??(()=>{}),l,u=!1;if(t.getElementById(a)===null){let e=t.createElement(`style`);e.id=a,e.textContent=o,t.head.appendChild(e)}let d=()=>{if(l===void 0)return;let e=l.style.gridTemplateColumns.trim().split(/\s+/)[0]??``;/^\d+(?:\.\d+)?px$/.test(e)?l.style.setProperty(i,e):l.style.removeProperty(i)},f=()=>{if(l!==void 0&&l.isConnected&&l.hasAttribute(r))return l;let e=t.querySelector(`[data-rightbar-col]`)?.parentElement??null;if(e!==null)return e.setAttribute(r,``),l=e,d(),l},p=new MutationObserver(e=>{if(!u){if(l===void 0||!l.isConnected||!l.hasAttribute(r)){f()===void 0&&c(`rightbar overlay: frame not found yet`);return}e.some(e=>e.target===l&&e.attributeName===`style`)&&d()}});return t.body!==null&&p.observe(t.body,{attributes:!0,attributeFilter:[`style`],childList:!0,subtree:!0}),f()===void 0&&c(`rightbar overlay: frame not found yet`),{dispose:()=>{u=!0,p.disconnect(),t.getElementById(a)?.remove(),l!==void 0&&(l.removeAttribute(r),l.style.removeProperty(i))}}}let c=`rightbar-overlay`,l=[];function u(e){try{let t=e.logger(c);if(typeof t?.info==`function`&&typeof t?.warn==`function`)return t}catch{}return{info:e=>{console.info(`[${c}] ${e}`)},warn:e=>{console.warn(`[${c}] ${e}`)}}}function d(e){let t=u(e);try{let n=s({log:e=>t.info(e)});e.effect(()=>()=>n.dispose(),`rightbar-overlay: layout`),t.info(`rightbar overlay: registered`)}catch(e){t.warn(`rightbar overlay: registration failed — ${e instanceof Error?e.message:String(e)}`)}}return n.apply=d,n.inject=l,n.name=c,t.exports}});
//# sourceMappingURL=client.js.map