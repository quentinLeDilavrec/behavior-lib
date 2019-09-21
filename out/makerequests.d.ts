/// <reference types="node" />
import { ClientConfig } from 'pg';
import { PassThrough } from "stream";
export declare function genBehavioralReq(init_cols: any[]): string;
/**
 *
 * @param {string[]} keys like ['path','sl','sc','el','ec']
 * @param {any[]} values like ['packages/hooks/src/createRunHook.js', 12, 0, 71, 1]
 * @param {Array<'prev'|'next'>} moves like ['prev','next','next','prev','prev']
 */
export declare function getPaths(config: ClientConfig, keys: string[], values: any[], moves: ('prev' | 'p' | 'next' | 'n')[], particulars?: string[]): Promise<void>;
export declare function getMultiDistrib(config: ClientConfig, path?: string, order?: string, origin?: string): PassThrough;
export declare function getDistrib(config: ClientConfig, path?: string, n?: number, size?: number, order?: string, origin?: string): PassThrough;
export declare function getTrace(config: ClientConfig, session?: number, computation?: 'mean_pos', origin?: string): PassThrough;
