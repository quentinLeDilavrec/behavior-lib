import { ClientConfig } from 'pg';
export declare function generate_stack(config?: ClientConfig, restart?: 'always', adminer_port?: number): string;
/**
 * Launch the database using docker-compose
 * @param stack_file the file containing the docker-compose stack
 */
export declare function startDataBase(stack_file: string): void;
/**
 * install all the necessary functions on the database
 * @param config the database config
 */
export declare function installFunctions(config: ClientConfig): Promise<void>;
/**
 * install all the necessary tables on the database
 * @param config the database config
 */
export declare function installTables(config: ClientConfig): Promise<void>;
