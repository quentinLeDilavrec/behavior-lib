import { NgramStats } from "./behaviorTypes";
export declare class ConnectionProblem extends Error {
    message: string;
    originalError?: Error | undefined;
    config?: any;
    constructor(message: string, originalError?: Error | undefined, config?: any);
}
export interface BehaviorClient {
    makeReq<T>(keys: string[], values: T[], origin: string, n?: number): Promise<NgramStats[]>;
    getMostUsedFcts(origin: string, min_size?: number, params?: boolean): Promise<{
        path: string;
        sl: number;
        sc: number;
        pocc: number;
        tocc: number;
    }[]>;
}
