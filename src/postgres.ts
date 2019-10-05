import { Client, Pool } from 'pg';
import { from as copyFrom } from "pg-copy-streams";
import * as fs from "fs";
import { PassThrough, Transform } from "stream";
import { merge } from "event-stream";
import { resolve } from 'url';
import { NgramStats } from './behaviorTypes';
import { BehaviorClient } from './behaviorClient';


export class BehaviorClientPostgres implements BehaviorClient {
  private pool: Pool;

  constructor(user: string, host: string, database: string, password: string, port: number) {
    this.pool = new Pool(
      {
        user: user,
        host: host,
        database: database,
        password: password,
        port: port,
        max: 30,
      }
    ).on('error', (error, client) => {
      console.error('Unexpected error on idle client', error, client);
      process.exit(-1);
    });
  }

  public async testConnection(): Promise<Error | undefined> {
    try {
      let error: Error | undefined = undefined;
      const client = await this.pool.connect().catch(x => {error = x;});
      if (typeof client === 'undefined') {
        return error;
      }
      try {
        await (client.query('select 1+1'));
      } catch (error) {
        return error;
      } finally {
        await client.release();
      }
    } catch (error) {
      return error;
    }
  }


  private async req_as_object<T>(req: string, params: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    let res = [];
    try {
      const tmp = await (client
        .query(req, params)
        .catch(err => console.error('connection error', err)));
      res = (tmp === undefined) ? [] : tmp.rows.map(x => {
        if (x.shift !== undefined) {
          x.shift = parseInt(x.shift);
        }
        x.pocc = parseInt(x.pocc);
        x.tocc = parseInt(x.tocc);
        return x;
      });

    } catch (error) {
      console.error(error);
    } finally {
      console.log('res:', res);
      await client.release();
    }
    return res;
  }

  private getFct(l: any[], namespace?: string) {
    return 'CONCAT(' + l.map(x => namespace ? namespace + '.' + x : x).join(",':',") + ')';
  }
  async makeReq<T>(keys: string[], values: T[], origin: string = 'gutenberg', n?: number) {
    let req = '';
    if (n === undefined) {
      req += `
SELECT ARRAY_AGG(g.fct ORDER BY g.line) as ngram,MAX(g.pocc) as pocc, MAX(g.tocc) as tocc, MAX(shift) as shift
FROM (
  SELECT ${this.getFct(keys)} as fct, g.pocc, g.tocc, c.line, g.hash, g.shift
  FROM getngrams($2,$3,$4,$5,$6,100::smallint) as g,
        calls c
  WHERE $1 = c.origin
  AND c.session = g.session
  AND line >= g.left
  AND line < g.left+g.n) g
GROUP BY g.hash;
    `;
    } else if (n < 2) {
      const group_columns = ['path', 'sl', 'sc', 'el', 'ec'];
      // TODO search in grouptable before with md5 then group in calls
      req += `
SELECT ARRAY[${this.getFct(keys)}] as ngram,
SUM((SIGN(session)>0)::int) as pocc,
SUM((SIGN(session)<0)::int) as tocc
FROM calls c
WHERE $1 = c.origin
AND (
  ${values.filter((x, i) => i % 5 === 0)
          .map((x, i) => `(c.path <@ formatPath($${i * 5 + 1 + 1}) AND sl = $${i * 5 + 2 + 1} AND sc = $${i * 5 + 3 + 1} AND el = $${i * 5 + 4 + 1} AND ec = $${i * 5 + 5 + 1})`)
          .join(' OR ')}
)
GROUP BY ${group_columns.join(', ')}
    `;
    } else {
      if (n > 2) {
        const req = `SELECT continuecomputengram($1,$2,$3,$4,$5,True,True);`; // TODO should use origin
        console.log('Doing a request: ', req, values);
        await this.req_as_object<NgramStats>(req, values);
        //       req += ` 
        // WITH x as (
        //   SELECT continuecomputengram($1,$2,$3,$4,$5,True,True)
        // )
        //     `; // !!! TODO change this, it seems to be lazy evaluated!!!
      }
      if (n === 2) {
        const req = `SELECT compute2gram($1,$2,$3,$4,$5);`; // TODO should use origin
        console.log('Doing a request: ', req, values);
        await this.req_as_object<NgramStats>(req, values);
        //       req += ` 
        // WITH x as (
        //   SELECT continuecomputengram($1,$2,$3,$4,$5,True,True)
        // )
        //     `; // !!! TODO change this, it seems to be lazy evaluated!!!
      }
      req += `
SELECT ARRAY_AGG(g.fct ORDER BY g.line) as ngram,MAX(g.pocc) as pocc, MAX(g.tocc) as tocc, MAX(shift) as shift
FROM (
  SELECT ${this.getFct(keys)} as fct, g.pocc, g.tocc, c.line, g.hash, g.shift
  FROM getngrams($2,$3,$4,$5,$6,100::smallint) as g,
       calls c
  WHERE $1 = c.origin
  AND c.session = g.session
  AND line >= g.left
  AND line < g.left+g.n) g
GROUP BY g.hash;
`;
    }

    console.log('Doing a request: ', req, n, origin, values);
    return await this.req_as_object<NgramStats>(req, [origin, ...values]);
  }

  async getMostUsedFcts(origin = 'gutenberg', min_size = 0, params = false) {// TODO remove default value
    let req = '';
    if (params) {
      const group_columns = ['formatPath(path)', 'sl', 'sc', 'el', 'ec', "params::text"];
      req += `
SELECT formatPath(path) as path, sl, sc, el, ec, params::text,
SUM((SIGN(session)>0)::int) as pocc,
SUM((SIGN(session)<0)::int) as tocc
FROM calls c
WHERE $1 = c.origin
GROUP BY ${group_columns.join(', ')}
    `;
      // HAVING SUM((SIGN(session)<0)::int) * $1 < SUM((SIGN(session)>0)::int)
    } else {
      const group_columns = ['formatPath(path)', 'sl', 'sc', 'el', 'ec'];
      req += `
SELECT formatPath(path) as path, sl, sc, el, ec,
SUM((SIGN(session)>0)::int) as pocc,
SUM((SIGN(session)<0)::int) as tocc
FROM calls c
WHERE $1 = c.origin
GROUP BY ${group_columns.join(', ')}
  `;
      // HAVING SUM((SIGN(session)<0)::int) * $1 < SUM((SIGN(session)>0)::int)
    }

    console.log('Doing a request: ', req, min_size);
    return await this.req_as_object<{ path: string, sl: number, sc: number, pocc: number, tocc: number }>(
      req, [origin/*, min_size*/]);
  }
}