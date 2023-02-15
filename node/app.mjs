import { readFile } from "node:fs/promises";
import { WASI } from "wasi";

const wasi = new WASI({});

const wasmCode = await readFile(`${process.cwd()}/target/wasm32-wasi/release/main.wasm`);
const wasmModule = await WebAssembly.compile(wasmCode);
const wasmInstance = await WebAssembly.instantiate(wasmModule, {
	"wasi_snapshot_preview1" : wasi.wasiImport
});

wasi.start(wasmInstance);