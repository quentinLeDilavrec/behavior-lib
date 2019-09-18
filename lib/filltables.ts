import { Client } from 'pg';
import { from as copyFrom } from "pg-copy-streams";
import * as fs from "fs";
import { Readable } from 'stream';

const DEFAULT_CLIENT = new Client({
  user: 'ubehavior',
  host: 'localhost',
  database: 'behaviordb',
  password: 'password',
  port: 5432,
})

export async function exportFile(input: string | Readable, client: Client = DEFAULT_CLIENT) {
  const table = 'public.calls';

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
  exportFile(process.argv[2]);
}