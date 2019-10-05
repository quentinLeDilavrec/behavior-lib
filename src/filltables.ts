import { Client, ClientConfig } from 'pg';
import { from as copyFrom } from "pg-copy-streams";
import * as fs from "fs";
import { Readable } from 'stream';

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

export async function getAlreadyUploaded(config: ClientConfig,origin:string) {
  const client = new Client(config)

  await client.connect();

  await client.query(`
  SELECT path FROM sessions
  WHERE origin = $1
  `,[origin]);

  await client.end();
  
}

export async function getUpperLower(config: ClientConfig,origin:string) {
  const client = new Client(config)

  await client.connect();

  await client.query(`
  SELECT MAX(session), MIN(session) FROM sessions
  WHERE origin = $1
  `,[origin]);

  await client.end();
  
}

export async function fillSessions(config: ClientConfig,origin:string) {
  const client = new Client(config)

  await client.connect();

  await client.query(`
  SELECT MAX(session), MIN(session) FROM sessions
  WHERE origin = $1
  `,[origin]);

  await client.end();
  
}