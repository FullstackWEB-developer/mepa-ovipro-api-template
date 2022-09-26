import { entities } from '@almamedia/ovipro-common-entities';
import { Connection, createConnection } from 'typeorm';
import { ConnectionFactory } from '../../dao/typeorm/ConnectionFactory';

/**
 * This file contains DB test utilities for Typeorm connection testing.
 */

/**
 * Make sure the real connection factory connections are mocked for replacement.
 */
ConnectionFactory.getConnection = jest.fn();

/**
 * This variable caches the Typeorm DB connection between calls.
 */
let connection: Connection;

/**
 * Docker image (PostgreSQL DB) configuration for DB test connections.
 */
export type Props = {
    database: string;
    username: string;
    password: string;
    port: number;
};

/**
 * Create a Typeorm connection for testing purposes. The connection is cached after the first call,
 * allowing only a single configuration per test setup.
 */
export async function createConnectionForTests(config: Props): Promise<Connection> {
    if (connection) {
        return connection;
    }
    console.log(JSON.stringify(config));
    connection = await createConnection({
        type: 'postgres',
        database: config.database,
        username: config.username,
        password: config.password,
        port: config.port,
        schema: 'foo',
        extra: { applicationNane: 'integrationTest' },
        logging: true,
        dropSchema: false,
        entities,
        synchronize: false,
    });
    return connection;
}
