import { Client, ClientConfig } from 'pg';
import { from as copyFrom } from "pg-copy-streams";
import * as fs from "fs";
import { Readable, PassThrough } from 'stream';
import { ltreeFormat } from './formatting';

// const DEFAULT_CONFIG = {
//   user: 'ubehavior',
//   host: 'localhost',
//   database: 'behaviordb',
//   password: 'password',
//   port: 5432,
// }

export async function exportFile(input: string | Readable, config: ClientConfig) {
  const table = 'public.calls';
  const client = new Client(config);

  await client.connect();

  const stream = client.query(copyFrom(`
COPY ${table} FROM STDIN
WITH (FORMAT csv,
  QUOTE '"',
  ESCAPE '\\',
  NULL '\\N')
  `));
  const fileStream = typeof input === 'string' ? fs.createReadStream(input) : input;
  fileStream.on('error', (...x) => {
    console.error(x)
    client.end()
  });
  stream.on('error', x => {
    console.error(x)
    client.end()
  });
  stream.on('end', (...x) => {
    console.log(x)
    client.end()
  });
  fileStream.pipe(stream)
}

if (typeof require != 'undefined' && require.main == module) {
  const DEFAULT_CONFIG = {
    user: 'ubehavior',
    host: 'localhost',
    database: 'behaviordb',
    password: 'password',
    port: 5432,
  }
  console.log('use ', DEFAULT_CONFIG)
  exportFile(process.argv[2], DEFAULT_CONFIG);
}

export async function getAlreadyUploaded(config: ClientConfig, origin: string) {
  const client = new Client(config)

  await client.connect();

  const res = (await client.query(`
  SELECT formatPath(path) as path FROM sessions
  WHERE origin = $1
  `, [origin]));

  await client.end();
  return res.rows;
}

export async function getUpperLower(config: ClientConfig, origin: string) {
  const client = new Client(config)

  await client.connect();

  const res = (await client.query(`
  SELECT MAX(session) as upper, MIN(session) as lower FROM sessions
  WHERE origin = $1
  `, [origin]));

  await client.end();
  return res.rows;
}

export async function fillSessions(config: ClientConfig, origin: string, entries: [string, number][]) {
  const table = 'public.sessions';
  const client = new Client(config);

  await client.connect();

  const stream = client.query(copyFrom(`
COPY ${table} FROM STDIN
WITH (FORMAT csv,
  QUOTE '"',
  ESCAPE '\\',
  NULL '\\N')
  `));
  const fileStream = new PassThrough();
  fileStream.on('error', (...x) => {
    console.error(x)
    client.end()
  });
  stream.on('error', x => {
    console.error(x)
    client.end()
  });
  stream.on('end', (...x) => {
    console.log(x)
    client.end()
  });
  entries.forEach(([p, s]) => {
    fileStream.push(ltreeFormat(p) + ',' + s + ',' + origin + '\n')
  })
  fileStream.end();
  fileStream.pipe(stream)
}