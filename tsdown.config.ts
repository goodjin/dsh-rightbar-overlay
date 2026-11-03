/**
 * 浏览器半边的打包配置。
 *
 * DSH 只下发 `exports["./client"]` 指向的那一个文件，并原样塞进页面的模块表；
 * 它必须是「单文件 CJS 工厂」，外面套一层 `window.__ModuleLoader__.load(...)`，
 * factory 收到的 `require` 负责把 react 这类外置模块从页面的模块表里取出来。
 * 这与 DSH 自带客户端插件、以及 @goodjin2/dsh-chat-area / dsh-acp-agent 的产物
 * 同款。
 *
 * 踩过的坑（2026-11-03）：产物曾经是一个普通 ESM 模块（tsdown 的 esm 格式 +
 * "use client" banner）。页面把它当普通脚本加载，`import` 语句直接是语法错误，
 * 浏览器半边整块不注册——宿主那一行随后被判成导入失败，包根本没进启动图，
 * 界面上一个字的报错都没有。
 *
 * 本插件的浏览器代码只用 DOM，没有外部依赖（react 之类一概不需要），所以
 * factory 里没有 require 调用。
 */

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'

const id = '@goodjin2/dsh-rightbar-overlay'
const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  entry: { client: `${root}src/client.ts` },
  outDir: `${root}lib`,
  format: 'cjs',
  platform: 'browser',
  target: 'es2024',
  dts: false,
  sourcemap: true,
  minify: true,
  clean: true,
  outputOptions: {
    inlineDynamicImports: true,
    entryFileNames: 'client.js',
    banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, factory: (require) => {`,
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
  },
})
