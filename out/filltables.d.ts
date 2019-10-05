/// <reference types="node" />
import { ClientConfig } from 'pg';
import { Readable } from 'stream';
export declare function exportFile(input: string | Readable, config: ClientConfig): Promise<void>;
export declare function getAlreadyUploaded(config: ClientConfig, origin: string): Promise<void>;
export declare function getUpperLower(config: ClientConfig, origin: string): Promise<void>;
export declare function fillSessions(config: ClientConfig, origin: string): Promise<void>;
