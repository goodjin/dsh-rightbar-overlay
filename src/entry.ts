/**
 * 宿主侧的挂载行：什么都不做。
 *
 * DSH 扫的是 Loader 的行：只有某一行的 name 恰好等于包名（裸包名）时，那个包
 * 才会进 window.__DSH_BOOT__（`ClientModuleRegistry.resolveMeta` 经
 * `locatePkgJson` 解析；带子路径的名字不算客户端行）。所以本包需要一条以裸
 * 包名挂载的行，而那条行导入的就是这个文件。
 *
 * 它必须能在 node 里安全 import：浏览器代码（DOM）放到 lib/client.js，由
 * exports["./client"] 下发。这个插件在宿主侧没有任何行为——它只改页面的布局。
 */

/** Loader 行与诊断里看到的插件名。 */
export const name = 'threadharbor-overlay'

/** 宿主侧没有行为：右侧栏的覆盖布局全在浏览器半边。 */
export function apply(): void {}
