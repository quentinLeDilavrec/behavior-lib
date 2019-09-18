/// <reference types="node" />
import * as fs from "fs";
/**
 *
 * @param readStream input stream to process
 * @param n ngram size
 * @param type
 */
export declare function count_ngrams(readStream: fs.ReadStream, n: number, type: 'count' | 'print' | 'uniq_count'): import("stream").Readable;
