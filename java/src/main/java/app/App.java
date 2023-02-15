package app;

import java.util.Arrays;
import java.util.Collection;
import java.util.ArrayList;

import io.github.kawamuray.wasmtime.Store;
import io.github.kawamuray.wasmtime.Engine;
import io.github.kawamuray.wasmtime.Extern;
import io.github.kawamuray.wasmtime.Module;
import io.github.kawamuray.wasmtime.Instance;
import io.github.kawamuray.wasmtime.WasmFunctions;
import io.github.kawamuray.wasmtime.Func;
import io.github.kawamuray.wasmtime.Linker;
import io.github.kawamuray.wasmtime.wasi.WasiCtx;
import io.github.kawamuray.wasmtime.wasi.WasiCtxBuilder;

public class App {
	public static void main(String[] args) {
		WasiCtx wasiCtx = new WasiCtxBuilder().inheritStdout().build();
		Store<Void> store = Store.withoutData(wasiCtx);
		Engine engine = store.engine();
		Linker linker = new Linker(engine);
		wasiCtx.addToLinker(linker);
		Module module = Module.fromFile(engine, "../target/wasm32-wasi/release/main.wasm");
		linker.module(store, "", module);

		Func f = linker.get(store, "", "_start").get().func();

		f.call(store);
	}
}