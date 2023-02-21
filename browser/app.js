const textEncoder = new TextEncoder();
let stdin = textEncoder.encode("stdio");
const env = {
	FOO: "FOO",
	BAR: "BAR"
};

const envStrings = Object.entries(env).map(([k, v]) => `${k}=${v}`);
const envEncodedStrings = envStrings.map(s => textEncoder.encode(s + "\0"))

const imports = {
	"wasi_snapshot_preview1" : {
		fd_write(fd, iovsPtr, iovsLength, bytesWrittenPtr){
			const iovs = new Uint32Array(instance.exports.memory.buffer, iovsPtr, iovsLength * 2);
			if(fd === 1) { //stdout
				let text = "";
				let totalBytesWritten = 0;

				const decoder = new TextDecoder();
				for(let i =0; i < iovsLength * 2; i += 2){
					const offset = iovs[i];
					const length = iovs[i+1];
					const textChunk = decoder.decode(new Int8Array(instance.exports.memory.buffer, offset, length));
					text += textChunk;
					totalBytesWritten += length;
				}

				const dataView = new DataView(instance.exports.memory.buffer);
				dataView.setInt32(bytesWrittenPtr, totalBytesWritten, true);
				console.log(text);
			}
			return 0;
		},
		fd_read(fd, iovsPtr, iovsLength, bytesReadPtr){
			const memory = new Uint8Array(instance.exports.memory.buffer);
			const iovs = new Uint32Array(instance.exports.memory.buffer, iovsPtr, iovsLength * 2);
			let totalBytesRead = 0;
			if(fd === 0) {//stdin
				for(let i = 0; i < iovsLength * 2; i += 2){
					const offset = iovs[i];
					const length = iovs[i+1];
					const chunk = stdin.slice(0, length);
					stdin = stdin.slice(length);

					memory.set(chunk, offset);
					totalBytesRead += chunk.byteLength;

					if(stdin.length === 0) break;
				}

				const dataView = new DataView(instance.exports.memory.buffer);
				dataView.setInt32(bytesReadPtr, totalBytesRead, true);
			}
			return 0;
		},
		environ_get(environPtr, environBufferPtr){
			const envByteLength = envEncodedStrings.map(s => s.byteLength).reduce((sum, val) => sum + val);
			const environsPointerBuffer = new Uint32Array(instance.exports.memory.buffer, environPtr, envEncodedStrings.length);
			const environsBuffer = new Uint8Array(instance.exports.memory.buffer, environBufferPtr, envByteLength)
			
			let pointerOffset = 0;
			for(let i = 0; i < envEncodedStrings.length; i++){
				const currentPointer = environBufferPtr + pointerOffset;
				environsPointerBuffer[i] = currentPointer;
				environsBuffer.set(envEncodedStrings[i], pointerOffset)  
				pointerOffset += envEncodedStrings[i].byteLength;
			}

			return 0;
		},
		environ_sizes_get(environCountPtr, environBufferSizePtr){
			const envByteLength = envEncodedStrings.map(s => s.byteLength).reduce((sum, val) => sum + val);
			const countPointerBuffer = new Uint32Array(instance.exports.memory.buffer, environCountPtr, 1);
			const sizePointerBuffer = new Uint32Array(instance.exports.memory.buffer, environBufferSizePtr, 1);
			countPointerBuffer[0] = envEncodedStrings.length;
			sizePointerBuffer[0] = envByteLength;
			return 0;
		},
		proc_exit(){ console.log("EXIT"); }
	}
};

const { instance } = await WebAssembly.instantiateStreaming(fetch("../target/wasm32-wasi/release/main.wasm"), imports);
instance.exports._start();
