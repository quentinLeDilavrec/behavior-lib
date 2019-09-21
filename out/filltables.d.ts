/// <reference types="node" />
import { ClientConfig } from 'pg';
import { Readable } from 'stream';
export declare function exportFile(input: string | Readable, config: ClientConfig): Promise<void>;
