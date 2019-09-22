import { NgramStats } from "./behaviorTypes";

export interface BehaviorClient {
    makeReq<T>(keys: string[], values: T[], origin:string, n?:number): Promise<NgramStats[]>;
    getMostUsedFcts(origin:string, min_size?:number, params?:boolean): Promise<{ path: string, sl: number, sc: number, pocc: number, tocc: number }[]>;
}
