#!/usr/bin/env node
'use strict';
import { getTrace, getDistrib, getMultiDistrib, getPaths } from "../out";
import { reformatFile, exportFile } from "../out";
import { PassThrough } from "stream";
// var makerequests = require('./dist/makerequests.pg.ts')

const DEFAULT_CONFIG = {
    user: 'ubehavior',
    host: 'localhost',
    database: 'behaviordb',
    password: 'password',
    port: 5432,
}

var ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
    version: '0.0.1',
    addHelp: true,
    description: 'Utils for database management in behavior analysis',
});
var subparsers = parser.addSubparsers({
    title: 'subcommands',
    dest: "subcommand_name"
});

var bar = subparsers.addParser(
    'start',
    { addHelp: true });
bar.addArgument(
    ['--csv'],
    {
        action: 'storeTrue',
        help: 'upload the file as an already formated trace'
    }
);

var bar = subparsers.addParser(
    'upload',
    { addHelp: true });
bar.addArgument(
    ['--csv'],
    {
        action: 'storeTrue',
        help: 'upload the file as an already formated trace'
    }
);
bar.addArgument(['input'], {
    type: 'string',
    nargs: '+',
    help: 'input files path'
});
var bar = subparsers.addParser(
    'trace',
    { addHelp: true }
);
bar.addArgument(
    ['--mean-pos'],
    {
        action: 'storeTrue',
        help: 'the mean position of calls in traces'
    }
);
bar.addArgument(
    ['--session'],
    {
        action: 'storeTrue',
        help: 'the session that we want to look at'
    }
);
bar.addArgument(
    ['-o', '--output'], {
        action: 'storeTrue'
    });
var bar = subparsers.addParser(
    'dist',
    {
        addHelp: true,
        help: 'get a distribution of call'
    }
);
bar.addArgument(
    ['--multi'],
    {
        action: 'storeTrue',
        help: 'group by directories'
    }
);
bar.addArgument(
    ['-o', '--output'], {
        action: 'True'
    });
var bar = subparsers.addParser(
    'explore',
    {
        addHelp: true,
        help: 'explore traces',
    }
);
bar.addArgument(
    ['--from'],
    {
        action: 'store',
        type: 'string',
        help: 'starting point of the exploration',
        required: true
    }
);
bar.addArgument(['moves'], {
    type: 'string',
    nargs: '*',
    choices: ['n', 'p'],
    help: 'an integer for the accumulator'
});

var args = parser.parseArgs();
console.dir(args);

if (args.subcommand_name === 'upload') {
    if (args.csv) {
        exportFile(DEFAULT_CONFIG, args.input[0])
    } else {
        const inter = reformatFile(args.input.map((x,i)=>[x,i+1]));
        exportFile(inter)
    }
} else if (args.subcommand_name === 'trace') {
    if (args.min_pos) {
        getTrace(DEFAULT_CONFIG, args.session, "mean_pos", args.origin).pipe(process.stdout)
    } else {
        getTrace(DEFAULT_CONFIG, args.session, undefined, args.origin).pipe(process.stdout)
    }
} else if (args.subcommand_name === 'dist') {
    if (args.multi) {
        getMultiDistrib(DEFAULT_CONFIG, 'packages/*/**/*', args.order, args.origin).pipe(process.stdout)
    } else {
        getDistrib(DEFAULT_CONFIG, 'packages/**/*', args.n).pipe(process.stdout)
    }
} else if (args.subcommand_name === 'explore') {
    getPaths(DEFAULT_CONFIG, ['path', 'sl', 'sc', 'el', 'ec'], args.from.split(/:/g), args.moves)
} else {

}