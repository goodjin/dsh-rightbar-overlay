"use client"
const require_src = require('./src-C91aEA7_.cjs');

//#region src/client.ts
/** Loader 行与诊断里看到的插件名。 */
const name = "rightbar-overlay";
/** 依赖：无。这个插件只操作 DOM，不需要任何 DSH 服务。 */
const inject = [];
/** 日志：插件的 logger 找不到时退回 console，绝不因为日志把整条 entry 弄挂。 */
function safeLogger(ctx) {
	try {
		const logger = ctx.logger(name);
		if (typeof logger?.info === "function" && typeof logger?.warn === "function") return logger;
	} catch {}
	return {
		info: (message) => {
			console.info(`[${name}] ${message}`);
		},
		warn: (message) => {
			console.warn(`[${name}] ${message}`);
		}
	};
}
function apply(ctx) {
	const log = safeLogger(ctx);
	try {
		const overlay = require_src.startRightbarOverlay({ log: (message) => log.info(message) });
		ctx.effect(() => () => overlay.dispose(), "rightbar-overlay: layout");
		log.info("rightbar overlay: registered");
	} catch (error) {
		log.warn(`rightbar overlay: registration failed — ${error instanceof Error ? error.message : String(error)}`);
	}
}

//#endregion
exports.apply = apply;
exports.inject = inject;
exports.name = name;