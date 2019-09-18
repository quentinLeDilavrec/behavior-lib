"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const es = require("event-stream");
const fs = require("fs");
const child_process_1 = require("child_process");
function duplicator(size) {
    const mem = (new Array(size)).fill('$');
    let pos = 0;
    return function (line) {
        let r = '';
        for (let i = 1; i < size + 1; i++) {
            r += mem[(pos + i) % size];
        }
        mem[pos = ((pos + 1) % size)] = line;
        return r + line + '\n';
    };
}
/**
 *
 * @param readStream input stream to process
 * @param n ngram size
 * @param type
 */
function count_ngrams(readStream, n, type) {
    let cmd;
    if (type === 'count') {
        cmd = ['sh', ['-c', "sort | uniq -c | awk '{print $1;}' | sort -nr"]];
    }
    else if (type === 'print') {
        cmd = ['cat', []];
    }
    else if (type === 'uniq_count') {
        cmd = ['sh', ['-c', "sort | uniq | wc -l"]];
    }
    else {
        throw new Error("don't know this way of processing the stream");
    }
    const exe = child_process_1.spawn(cmd[0], cmd[1], { stdio: ['pipe', 'pipe', 2, 'ipc'] });
    if (exe.stdin === null)
        throw new Error("no stdin");
    readStream
        .pipe(es.split())
        .pipe(es.mapSync(duplicator(n - 1)))
        .pipe(es.join('\n'))
        .pipe(exe.stdin);
    if (exe.stdout === null)
        throw new Error("no stdout");
    return exe.stdout;
}
exports.count_ngrams = count_ngrams;
if (typeof require != 'undefined' && require.main == module) {
    const readStream = fs.createReadStream(process.argv[2]);
    const a = process.argv[4];
    if (a !== "print" && a !== "count" && a !== "uniq_count")
        throw new Error(a + " should be print,count or uniq_count");
    const b = parseInt(process.argv[3]);
    count_ngrams(readStream, b, a).pipe(process.stdout);
    // count_ngrams('/home/quentin/Documents/cours/M1/stage/ongit/logs/from_sandboxes/1', 10)
}
//# sourceMappingURL=ngram.js.map