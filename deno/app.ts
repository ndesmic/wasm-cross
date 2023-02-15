import Context from "https://deno.land/std/wasi/snapshot_preview1.ts";
const context = new Context({
	args: Deno.args,
	env: Deno.env.toObject()
});
const wasmCode = await Deno.readFile(`${Deno.cwd()}/target/wasm32-wasi/release/main.wasm`);
const wasmModule = await WebAssembly.compile(wasmCode);
const wasmInstance = await WebAssembly.instantiate(wasmModule, {
	"wasi_snapshot_preview1" : context.exports
});

context.start(wasmInstance);