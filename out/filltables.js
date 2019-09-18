"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pg_copy_streams_1 = require("pg-copy-streams");
const fs = require("fs");
const DEFAULT_CLIENT = new pg_1.Client({
    user: 'ubehavior',
    host: 'localhost',
    database: 'behaviordb',
    password: 'password',
    port: 5432,
});
function exportFile(input, client = DEFAULT_CLIENT) {
    return __awaiter(this, void 0, void 0, function* () {
        const table = 'public.calls';
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
    exportFile(process.argv[2]);
}
//# sourceMappingURL=filltables.js.map