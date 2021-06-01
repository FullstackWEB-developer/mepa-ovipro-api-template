import { Connection, ConnectionOptions, createConnection } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { factory } from '../../utils/logging';
import { entities } from './EntityRegistry';

/**
 * Get an existing connection configuration object if available or create a new connection.
 * Note: In case of the Data API Typeorm doesn't do persistent connections.
 */
export const ConnectionFactory = {
    /**
     * Get a connection for this factory. The primary way to start creating queries with TypeORM.
     */
    async getConnection(): Promise<Connection> {
        return getConnection();
    },
};

let cachedConnection: Connection;

const getConnection = async (): Promise<Connection> => {
    if (cachedConnection) {
        return cachedConnection;
    }

    const dbName = process.env.DB_NAME || '';
    const readWriteUserSecretArn = process.env.READ_WRITE_SECRET_ARN || '';
    const dbClusterArn = process.env.DB_CLUSTER_ARN || '';
    const enableDbLogging = process.env.DB_LOGGING_ENABLED === 'true' || false;

    const options: ConnectionOptions = {
        type: 'aurora-data-api-pg',
        database: dbName,
        secretArn: readWriteUserSecretArn,
        resourceArn: dbClusterArn,
        region: process.env.AWS_REGION || 'eu-west-1',
        // All queried and linked entities must be listed here.
        entities,
        // Debug logging enabled
        logging: enableDbLogging,
        formatOptions: {
            // See automatic casting at https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver#automatic-casting
            castParameters: true,
        },
        namingStrategy: new SnakeNamingStrategy(),
    };

    log.debug(`Initialize connection with entities ${entities} and configuration ${JSON.stringify(options)}`);

    cachedConnection = await createConnection(options);

    return cachedConnection;
};

const log = factory.getLogger(ConnectionFactory.constructor.name);
