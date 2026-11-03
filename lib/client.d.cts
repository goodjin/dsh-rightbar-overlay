//#region src/client.d.ts
/**
 * Browser-side plugin entry for rightbar-overlay.
 */
/** Loader 行与诊断里看到的插件名。 */
declare const name = "rightbar-overlay";
/** 依赖：无。这个插件只操作 DOM，不需要任何 DSH 服务。 */
declare const inject: readonly [];
interface PluginContext {
  logger(name: string): {
    info(message: string): void;
    warn(message: string): void;
  };
  effect(callback: () => unknown, name?: string): unknown;
  get(name: string): unknown;
}
declare function apply(ctx: PluginContext): void;
//#endregion
export { PluginContext, apply, inject, name };