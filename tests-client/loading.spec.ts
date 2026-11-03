/**
 * 装载接线：这个插件要被 DSH 真的装到浏览器里，靠的是三件事同时成立——
 *
 * 1. package.json 声明 `dsh.bundle.patch`，否则 profile 读到这个 bundle 时
 *    直接跳过它（app-boot 的 profile 读取：bundle 没有 dsh.bundle 就算
 *    「无 bundle 的包」，一行都不挂）。
 * 2. package.json 声明 `dsh.client.platform = 'web'`，否则宿主的客户端模块
 *    注册表（ClientModuleRegistry.resolveMeta）不把它认成浏览器行。
 * 3. patch 里的行名是**裸包名**：DSH 只把 name 恰好等于包名的 Loader 行认成
 *    客户端行，带 `/client` 子路径的行会被判成不是客户端行，还会去 node 里
 *    import 浏览器产物——结果是功能整块消失且不报错。
 *
 * 这三条任何一条缺了，插件都装得上却不生效（2026-11 现场）。
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/** 仓库根：vitest 的 cwd 就是它（jsdom 下 import.meta.url 不是 file 协议）。 */
const root = process.cwd()

const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  name?: string
  exports?: Record<string, { default?: string; import?: string; require?: string } | string>
  dsh?: { bundle?: { patch?: string }; client?: { platform?: string } }
}

describe('装载接线', () => {
  it('声明 bundle patch 与浏览器半边，profile 才会挂它、浏览器才会跑它', () => {
    expect(manifest.name).toBe('@goodjin2/dsh-rightbar-overlay')
    expect(manifest.dsh?.bundle?.patch).toBe('./cordis.patch.yml')
    expect(manifest.dsh?.client?.platform).toBe('web')
  })

  it('patch 里的挂载行用裸包名', () => {
    const patchPath = resolve(root, manifest.dsh!.bundle!.patch!)
    expect(existsSync(patchPath)).toBe(true)
    const patch = readFileSync(patchPath, 'utf8')
    const packageName = manifest.name!
    expect(patch).toContain(`name: '${packageName}'`)
    expect(patch).not.toContain(`name: '${packageName}/client'`)
  })

  it('浏览器半边的产物在库里，exports 按宿主的形状指过去', () => {
    // 宿主解析客户端产物只认两种形状（client-modules 的 clientExportOf）：
    // 字符串，或带字符串 `default` 的对象。只有 import/require 而没有 default
    // 的会被当场判错——「exports["./client"] must be a string or an object with
    // a string default」。
    const clientExport = manifest.exports?.['./client']
    const target = typeof clientExport === 'string'
      ? clientExport
      : typeof (clientExport as { default?: unknown } | undefined)?.default === 'string'
        ? (clientExport as { default: string }).default
        : undefined
    expect(target).toBe('./lib/client.js')
    expect(existsSync(resolve(root, target!))).toBe(true)
  })
})
