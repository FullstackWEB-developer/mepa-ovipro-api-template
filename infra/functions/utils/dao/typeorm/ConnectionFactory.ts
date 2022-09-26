import { entities } from '@almamedia/ovipro-common-entities';
import { Connection, ConnectionOptions, createConnection, Logger as TypeormLogger } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Logger } from 'typescript-logging';
import { factory } from '../../logging';

const serviceName = process.env.SERVICE_NAME || 'UNDEFINED';
const moduleName = process.env.MODULE_NAME || 'UNDEFINED';
const environmentName = process.env.ENVIRONMENT || 'UNDEFINED';

// Sorry about negation. It's for backwards compatibility.
/**
 * Flag that tells if special handling uuids should be enabled or not.
 */
export const uuidCastingRequired = !(process.env.DB_IS_STANDARD_DRIVER === 'true');

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

/**
 * Custom logger for Typeorm.
 */
export class CustomTypeormLogger implements TypeormLogger {
    private readonly logger: Logger;
    constructor(log: Logger) {
        this.logger = log;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logQuery(query: string, parameters?: any[]): any {
        this.logger.debug(`query: ${query}, parameters: ${JSON.stringify(parameters)}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logQueryError(error: string | Error, query: string, parameters?: any[]): void {
        this.logger.error(`query ${query}, error: ${error.toString()}, parameters: ${JSON.stringify(parameters)}`, {
            name: 'dbError',
            message: error.toString(),
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logQuerySlow(time: number, query: string, parameters?: any[]): void {
        this.logger.debug(`Slow query ${query} executed in ${time} with parameters: ${JSON.stringify(parameters)}`);
    }

    logSchemaBuild(message: string): void {
        this.logger.debug(`Schema build ${message}`);
    }

    logMigration(message: string): void {
        this.logger.debug(`Schema migration ${message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(level: 'log' | 'info' | 'warn', message: string): void {
        switch (level) {
            case 'info':
                this.logger.info(message);
                break;
            case 'log':
                this.logger.debug(message);
                break;
            case 'warn':
                this.logger.warn(message);
        }
    }
}

let cachedConnection: Connection;

const getConnection = async (): Promise<Connection> => {
    if (cachedConnection) {
        return cachedConnection;
    }
    log.debug('Start get connection');
    const dbName = process.env.DB_NAME || '';
    const readWriteUserSecretArn = process.env.READ_WRITE_SECRET_ARN || '';
    const dbClusterArn = process.env.DB_CLUSTER_ARN || '';
    const enableDbLogging = process.env.DB_LOGGING_ENABLED === 'true' || false;

    // UUID casting is supposedly true by default for the data API driver. Data API client is weird. Stuff like uuids are fragile.
    // See automatic casting at https://github.com/ArsenyYankovsky/typeorm-aurora-data-api-driver#automatic-casting
    const formatOptions = uuidCastingRequired ? { castParameters: true } : undefined;

    log.debug(`GETConnection ${dbName} ${readWriteUserSecretArn} ${dbClusterArn} ${enableDbLogging}`);
    const options: ConnectionOptions = {
        type: 'aurora-postgres',
        database: dbName,
        secretArn: readWriteUserSecretArn,
        resourceArn: dbClusterArn,
        region: process.env.AWS_REGION || 'eu-west-1',
        extra: { applicationName: `${serviceName}|${moduleName}|${environmentName}` },
        // All queried and linked entities must be listed here.
        entities,
        // Debug logging enabled
        logging: enableDbLogging,
        logger: typeormLogger,
        formatOptions,
        namingStrategy: new SnakeNamingStrategy(),
    };

    log.debug(`Initialize connection with entities ${entities} and configuration ${JSON.stringify(options)}`);

    cachedConnection = await createConnection(options);

    return cachedConnection;
};

const log = factory.getLogger('ConnectionFactory');
const typeormLogger = new CustomTypeormLogger(log);
