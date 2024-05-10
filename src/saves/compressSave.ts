/**
 * MIT License
 * Copyright (c) 2024 Dexrn ZacAttack
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/

import { compressionTypes, compressRLE, compressZlib } from "../index.js";

export async function compressSave(save: File, compType: compressionTypes, lEndian = false): Promise<File> {
    // arraybuffer variable
    const fileArray = await save.arrayBuffer();
    const fileArrayBuffer = new Uint8Array(fileArray);
    /** decompressed size as bigint */
    const fileSize = BigInt(fileArray.byteLength)
    /** keep track of current position in stream */
    let currentOffset = 0;

    let compressedFile = new Uint8Array(fileArray);

    switch (compType) {
        case compressionTypes.zlib:
            compressedFile = compressZlib(fileArray);
            break;
        case compressionTypes.rle:
            compressedFile = compressRLE(fileArray);
            break;
        case compressionTypes.vitarle:
        case compressionTypes.switchrle:
        case compressionTypes.lzx:
        case compressionTypes.gzip:
        default:
            break;
        case compressionTypes.none:
            return new File([new Blob([fileArray])], 'savegame.dat');
    }

    /** allocate a dataview for the compressed data */
    const comp = new DataView(new Uint8Array([...fileArrayBuffer, ...compressedFile]).buffer);
    comp.setBigUint64(0, fileSize, lEndian)
    currentOffset += 8;

    for (var i: number = 0; i < compressedFile.length - 1; i++) {
        comp.setUint8(currentOffset, compressedFile[i]!);
        currentOffset += 1;
    }

    return new File([new Blob([comp.buffer])], 'savegame.dat');
}