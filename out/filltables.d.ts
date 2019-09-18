/// <reference types="node" />
import { Client } from 'pg';
import { Readable } from 'stream';
export declare function exportFile(input: string | Readable, client?: Client): Promise<void>;
