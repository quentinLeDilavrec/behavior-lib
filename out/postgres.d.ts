import { NgramStats } from './behaviorTypes';
import { BehaviorClient } from './behaviorClient';
export declare class BehaviorClientPostgres implements BehaviorClient {
    private pool;
    constructor(user: string, host: string, database: string, password: string, port: number);
    testConnection(): Promise<Error | undefined>;
    private req_as_object;
    private getFct;
    makeReq<T>(keys: string[], values: T[], origin?: string, n?: number): Promise<NgramStats[]>;
    getMostUsedFcts(origin?: string, min_size?: number, params?: boolean): Promise<{
        path: string;
        sl: number;
        sc: number;
        pocc: number;
        tocc: number;
    }[]>;
}
