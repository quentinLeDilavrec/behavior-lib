/// <reference types="node" />
import { Writable } from "stream";
export declare function reformatFileOld(inPath: string[] | string, output: string | Writable, getSession: number | ((i: number) => number), pattern?: RegExp): void;
export declare function reformatFile(input: [string, number][]): Writable;
