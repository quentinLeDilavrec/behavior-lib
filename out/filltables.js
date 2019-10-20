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
const pg_copy_streams_1 = require("pg-copy-streams");
const fs = require("fs");
const stream_1 = require("stream");
const formatting_1 = require("./formatting");
// const DEFAULT_CONFIG = {
//   user: 'ubehavior',
//   host: 'localhost',
//   database: 'behaviordb',
//   password: 'password',
//   port: 5432,
// }
function exportFile(input, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const table = 'public.calls';
        const client = new pg_1.Client(config);
        yield client.connect();
        const stream = client.query(pg_copy_streams_1.from(`
COPY ${table} FROM STDIN
WITH (FORMAT csv,
  QUOTE '"',
  ESCAPE '\\',
  NULL '\\N')
  `));
        const fileStream = typeof input === 'string' ? fs.createReadStream(input) : input;
        fileStream.on('error', (...x) => {
            console.error(x);
            client.end();
        });
        stream.on('error', x => {
            console.error(x);
            client.end();
        });
        stream.on('end', (...x) => {
            console.log(x);
            client.end();
        });
        fileStream.pipe(stream);
    });
}
exports.exportFile = exportFile;
if (typeof require != 'undefined' && require.main == module) {
    const DEFAULT_CONFIG = {
        user: 'ubehavior',
        host: 'localhost',
        database: 'behaviordb',
        password: 'password',
        port: 5432,
    };
    console.log('use ', DEFAULT_CONFIG);
    exportFile(process.argv[2], DEFAULT_CONFIG);
}
function getAlreadyUploaded(config, origin) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client(config);
        yield client.connect();
        const res = (yield client.query(`
  SELECT formatPath(path) as path FROM sessions
  WHERE origin = $1
  `, [origin]));
        yield client.end();
        return res.rows;
    });
}
exports.getAlreadyUploaded = getAlreadyUploaded;
function getUpperLower(config, origin) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client(config);
        yield client.connect();
        const res = (yield client.query(`
  SELECT MAX(session) as upper, MIN(session) as lower FROM sessions
  WHERE origin = $1
  `, [origin]));
        yield client.end();
        return res.rows;
    });
}
exports.getUpperLower = getUpperLower;
function fillSessions(config, origin, entries) {
    return __awaiter(this, void 0, void 0, function* () {
        const table = 'public.sessions';
        const client = new pg_1.Client(config);
        yield client.connect();
        const stream = client.query(pg_copy_streams_1.from(`
COPY ${table} FROM STDIN
WITH (FORMAT csv,
  QUOTE '"',
  ESCAPE '\\',
  NULL '\\N')
  `));
        const fileStream = new stream_1.PassThrough();
        fileStream.on('error', (...x) => {
            console.error(x);
            client.end();
        });
        stream.on('error', x => {
            console.error(x);
            client.end();
        });
        stream.on('end', (...x) => {
            console.log(x);
            client.end();
        });
        entries.forEach(([p, s]) => {
            fileStream.push(formatting_1.ltreeFormat(p) + ',' + s + ',' + origin + '\n');
        });
        fileStream.end();
        fileStream.pipe(stream);
    });
}
exports.fillSessions = fillSessions;
//# sourceMappingURL=filltables.js.map