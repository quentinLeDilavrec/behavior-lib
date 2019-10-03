import { NgramStats } from "./behaviorTypes";

export class ConnectionProblem extends Error {
    constructor(public message: string,public originalError?:Error,public config?:any) {
        super(message);
        this.name = 'ClientNotReachable';
        this.message = message;
        this.stack = (<any>new Error()).stack;
    }
}

export interface BehaviorClient {
    makeReq<T>(keys: string[], values: T[], origin:string, n?:number): Promise<NgramStats[]>;
    getMostUsedFcts(origin:string, min_size?:number, params?:boolean): Promise<{ path: string, sl: number, sc: number, pocc: number, tocc: number }[]>;
}
