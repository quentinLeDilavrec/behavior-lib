"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
class BehaviorClientPostgres {
    constructor(user, host, database, password, port) {
        this.pool = new pg_1.Pool({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port,
            max: 30,
        }).on('error', (err, client) => {
            console.error('Unexpected error on idle client', err, client);
            process.exit(-1);
        });
    }
    req_as_object(req, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.pool.connect();
            let res = [];
            try {
                const tmp = yield (client
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
            }
            catch (error) {
                console.error(error);
            }
            finally {
                console.log('res:', res);
                yield client.release();
            }
            return res;
        });
    }
    getFct(l, namespace) {
        return 'CONCAT(' + l.map(x => namespace ? namespace + '.' + x : x).join(",':',") + ')';
    }
    makeReq(keys, values, origin = 'gutenberg', n) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else if (n < 2) {
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
            }
            else {
                if (n > 2) {
                    const req = `SELECT continuecomputengram($1,$2,$3,$4,$5,True,True);`; // TODO should use origin
                    console.log('Doing a request: ', req, values);
                    yield this.req_as_object(req, values);
                    //       req += ` 
                    // WITH x as (
                    //   SELECT continuecomputengram($1,$2,$3,$4,$5,True,True)
                    // )
                    //     `; // !!! TODO change this, it seems to be lazy evaluated!!!
                }
                if (n === 2) {
                    const req = `SELECT compute2gram($1,$2,$3,$4,$5);`; // TODO should use origin
                    console.log('Doing a request: ', req, values);
                    yield this.req_as_object(req, values);
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
            return yield this.req_as_object(req, [origin, ...values]);
        });
    }
    getMostUsedFcts(origin = 'gutenberg', min_size = 0, params = false) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            else {
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
            return yield this.req_as_object(req, [origin /*, min_size*/]);
        });
    }
}
exports.BehaviorClientPostgres = BehaviorClientPostgres;
//# sourceMappingURL=postgres.js.map