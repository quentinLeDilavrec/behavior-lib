/// <reference types="node" />
import { Writable } from "stream";
export declare function reformatFile(inPath: string[] | string, output: string | Writable, getSession: number | ((i: number) => number), pattern?: RegExp): void;
