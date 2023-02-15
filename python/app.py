from wasmtime import Module, Store, Instance, WasiConfig, Linker

store = Store()
linker = Linker(store.engine)
linker.define_wasi()
wasi = WasiConfig()
wasi.inherit_stdout()
store.set_wasi(wasi)
module = Module.from_file(store.engine, './target/wasm32-wasi/release/main.wasm')
instance = linker.instantiate(store, module)

instance.exports(store).get("_start")(store)