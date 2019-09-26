import { Client, ClientConfig } from 'pg';
import { readFileSync } from "fs";
import { Readable } from 'stream';
import { exec } from 'child_process';
import { stringify } from 'yaml'
import { join } from 'path';

// const DEFAULT_CONFIG: ClientConfig = {
//   user: 'ubehavior',
//   host: 'localhost',
//   database: 'behaviordb',
//   password: 'password',
//   port: 5432,
// }
export function generate_stack(
  config: ClientConfig,
  restart: 'always' = 'always',
  adminer_port: number = 8080): string {
  const stack = {
    version: '3.1',
    services: {
      adminer:
      {
        image: "adminer",
        restart: restart,
        ports:
          [`${adminer_port}: 8080`]
      },
      dbPostgres:
      {
        image: "postgres",
        restart: restart,
        ports:
          [`${config.port}: 5432`],
        environment:
        {
          POSTGRES_USER: config.user,
          POSTGRES_PASSWORD: config.password,
          POSTGRES_DB: config.database
        }
      }
    }
  }
  return stringify(stack)
}

/**
 * Launch the database using docker-compose
 * @param stack_file the file containing the docker-compose stack
 */
export function startDataBase(stack_file: string) {
  exec(`docker-compose -f ${stack_file} up`, function (err, stdout, stderr) {
    if (err) {
      console.error(err)
    }
    console.log(stdout);
    console.error(stderr);
  });
}


/**
 * install all the necessary functions on the database
 * @param config the database config
 */
export async function installFunctions(config: ClientConfig) {
  const client = new Client(config)

  await client.connect();

  await client.query(readFileSync(join(__dirname,'../sql/utils.sql'), 'utf8'));
  await client.query(readFileSync(join(__dirname,'../sql/getngrams.sql'), 'utf8'));

  await client.end();
}
/**
 * install all the necessary tables on the database
 * @param config the database config
 */
export async function installTables(config: ClientConfig) {
  const client = new Client(config)

  await client.connect();

  await client.query(readFileSync(join(__dirname,'../sql/createBehaviorDB.sql'), 'utf8'));

  await client.end();
}