/**
 * Browser-side plugin entry for rightbar-overlay.
 */

import { startRightbarOverlay } from './index.ts'

/** Loader 行与诊断里看到的插件名。 */
export const name = 'rightbar-overlay'

/** 依赖：无。这个插件只操作 DOM，不需要任何 DSH 服务。 */
export const inject = [] as const

export interface PluginContext {
  logger(name: string): { info(message: string): void; warn(message: string): void }
  effect(callback: () => unknown, name?: string): unknown
  get(name: string): unknown
}

/** 日志：插件的 logger 找不到时退回 console，绝不因为日志把整条 entry 弄挂。 */
function safeLogger(ctx: PluginContext): { info(message: string): void; warn(message: string): void } {
  try {
    const logger = ctx.logger(name)
    if (typeof logger?.info === 'function' && typeof logger?.warn === 'function') return logger
  } catch {
    // 落下去，用 console
  }
  return {
    info: (message: string): void => { console.info(`[${name}] ${message}`) },
    warn: (message: string): void => { console.warn(`[${name}] ${message}`) },
  }
}

export function apply(ctx: PluginContext): void {
  const log = safeLogger(ctx)

  try {
    // 装上右侧栏覆盖布局
    const overlay = startRightbarOverlay({
      log: (message: string) => log.info(message),
    })
    ctx.effect(() => () => overlay.dispose(), 'rightbar-overlay: layout')
    log.info('rightbar overlay: registered')
  } catch (error: unknown) {
    log.warn(`rightbar overlay: registration failed — ${error instanceof Error ? error.message : String(error)}`)
  }
}
