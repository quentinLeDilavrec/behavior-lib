import { NgramStats } from './behaviorTypes';
import { BehaviorClient } from './behaviorClient';
export declare class BehaviorDBClientPostgres implements BehaviorClient {
    private pool;
    constructor(user: string, host: string, database: string, password: string, port: number);
    private req_as_object;
    private getFct;
    makeReq<T>(keys: string[], values: T[], n: number | undefined): Promise<NgramStats[]>;
    getMostUsedFcts(min_size?: number, params?: boolean): Promise<{
        path: string;
        sl: number;
        sc: number;
        pocc: number;
        tocc: number;
    }[]>;
}
