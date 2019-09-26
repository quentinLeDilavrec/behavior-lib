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
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const yaml_1 = require("yaml");
const path_1 = require("path");
// const DEFAULT_CONFIG: ClientConfig = {
//   user: 'ubehavior',
//   host: 'localhost',
//   database: 'behaviordb',
//   password: 'password',
//   port: 5432,
// }
function generate_stack(config, restart = 'always', adminer_port = 8080) {
    const stack = {
        version: '3.1',
        services: {
            adminer: {
                image: "adminer",
                restart: restart,
                ports: [`${adminer_port}: 8080`]
            },
            dbPostgres: {
                image: "postgres",
                restart: restart,
                ports: [`${config.port}: 5432`],
                environment: {
                    POSTGRES_USER: config.user,
                    POSTGRES_PASSWORD: config.password,
                    POSTGRES_DB: config.database
                }
            }
        }
    };
    return yaml_1.stringify(stack);
}
exports.generate_stack = generate_stack;
/**
 * Launch the database using docker-compose
 * @param stack_file the file containing the docker-compose stack
 */
function startDataBase(stack_file) {
    child_process_1.exec(`docker-compose -f ${stack_file} up`, function (err, stdout, stderr) {
        if (err) {
            console.error(err);
        }
        console.log(stdout);
        console.error(stderr);
    });
}
exports.startDataBase = startDataBase;
/**
 * install all the necessary functions on the database
 * @param config the database config
 */
function installFunctions(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client(config);
        yield client.connect();
        yield client.query(fs_1.readFileSync(path_1.join(__dirname, '../sql/utils.sql'), 'utf8'));
        yield client.query(fs_1.readFileSync(path_1.join(__dirname, '../sql/getngrams.sql'), 'utf8'));
        yield client.end();
    });
}
exports.installFunctions = installFunctions;
/**
 * install all the necessary tables on the database
 * @param config the database config
 */
function installTables(config) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new pg_1.Client(config);
        yield client.connect();
        yield client.query(fs_1.readFileSync(path_1.join(__dirname, '../sql/createBehaviorDB.sql'), 'utf8'));
        yield client.end();
    });
}
exports.installTables = installTables;
//# sourceMappingURL=setup.js.map