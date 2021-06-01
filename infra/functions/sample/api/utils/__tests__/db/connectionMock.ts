import { Connection, createConnection } from 'typeorm';
import { ConnectionFactory } from '../../../dao/typeorm/ConnectionFactory';
import { entities } from '../../../dao/typeorm/EntityRegistry';

ConnectionFactory.getConnection = jest.fn();

let connection: Connection;

export const createConnectionForTests = async (): Promise<Connection> => {
    if (connection) {
        return connection;
    }
    connection = await createConnection({
        type: 'sqlite',
        database: ':memory',
        logging: true,
        dropSchema: true,
        entities,
        synchronize: true,
    });
    return connection;
};
