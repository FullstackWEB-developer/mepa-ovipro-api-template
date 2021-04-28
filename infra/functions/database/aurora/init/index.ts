import AWS from 'aws-sdk';
import {
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceUpdateEvent,
    CloudFormationCustomResourceResponse,
} from 'aws-lambda';

const rdsDataService = new AWS.RDSDataService();
const secretsmanager = new AWS.SecretsManager();

const createCreateDatabaseQueries = () => [
    `create database ovipro;`,
    `comment on database ovipro is 'Ovipro default database';`,
];

/**
 * Creates users into the database. User details are fetched from Secret manager.
 * Clone (suffix _clone) users are created for the Flyway user with createrole permission to support
 * secret rotation properly.
 */
const createFlywayUserQueries = async () => {
    const flywayParams = {
        SecretId: process.env.FLYWAY_USER_SECRET_NAME || '',
        VersionStage: 'AWSCURRENT',
    };

    const oviproParams = {
        SecretId: process.env.READ_WRITE_USER_SECRET_NAME || '',
        VersionStage: 'AWSCURRENT',
    };

    const flywaySecret = await secretsmanager.getSecretValue(flywayParams).promise();

    const flywaySecretString = JSON.parse(flywaySecret.SecretString || '');

    const oviproSecret = await secretsmanager.getSecretValue(oviproParams).promise();

    const oviproSecretString = JSON.parse(oviproSecret.SecretString || '');

    // Multi-user rotation Lambda creates clone users during password/user rotation, but it doesn't include
    // createrole permission, which we want Flyway to have. Thus we create flyway_user and flyway_user_clone
    // manually with correct grants.
    return [
        `create user ${flywaySecretString.username} with encrypted password '${flywaySecretString.password}' createrole;`,
        `create user ${flywaySecretString.username}_clone with encrypted password '${flywaySecretString.password}' createrole;`,
        `create user ${oviproSecretString.username} with encrypted password '${oviproSecretString.password}';`,
        `grant all privileges on database ovipro to ${flywaySecretString.username};`,
        `grant all privileges on database ovipro to ${flywaySecretString.username}_clone;`,
        `grant ${oviproSecretString.username} to ${flywaySecretString.username};`,
        `grant ${oviproSecretString.username} to ${flywaySecretString.username}_clone;`,
    ];
};

/**
 * Executes given query to database
 *
 * @param query
 * @param transactionId
 */
const executeStatement = async (query: string) => {
    const sqlParams: AWS.RDSDataService.ExecuteStatementRequest = {
        secretArn: process.env.DB_SECRET_ARN || '',
        resourceArn: process.env.DB_CLUSTER_ARN || '',
        sql: query,
        database: process.env.DB_NAME,
        includeResultMetadata: true,
    };

    try {
        const result = await rdsDataService.executeStatement(sqlParams).promise();
        console.info(`executed query, result: ${JSON.stringify(result)}`);
    } catch (e) {
        console.error(`could not execute statement, error: ${e}`);
    }
};

/**
 * Reads file from given path and executes queries inside
 *
 * @param filePath
 */
const executeQueries = async () => {
    const flywayUserQueries = await createFlywayUserQueries();
    const queries = [...createCreateDatabaseQueries(), ...flywayUserQueries];
    try {
        /**
         * Cant use Promise.all here, we want to execute in series
         */
        for (const query of queries) {
            await executeStatement(query);
        }
    } catch (e) {
        console.error(`could execute statement, error: ${e}`);
    }
};

/**
 * Run migrations scripts when event is CREATE
 *
 * NOTE: currently handles also UPDATE-events
 *
 * @param event
 * @returns cfnresponse
 */
const onCreate = async (
    event: CloudFormationCustomResourceCreateEvent | CloudFormationCustomResourceUpdateEvent,
): Promise<CloudFormationCustomResourceResponse> => {
    console.info(`create new resource with props ${JSON.stringify(event.ResourceProperties)}`);
    console.info(`database arn: ${process.env.DB_SECRET_ARN || ''}`);
    console.info(`cluster arn: ${process.env.DB_CLUSTER_ARN || ''}`);
    console.info(`database name: ${process.env.DB_NAME || ''}`);
    // If multiple resources are created this cant be hardcoded
    const physicalId = 'DatabaseInitMigrationResource';

    try {
        console.info({ event });

        await executeQueries();

        console.info('migration complete');

        return {
            PhysicalResourceId: physicalId,
            Status: 'SUCCESS',
            RequestId: event.RequestId,
            StackId: event.StackId,
            LogicalResourceId: event.LogicalResourceId,
            Reason: `created database and user for migrations`,
        };
    } catch (e) {
        return {
            PhysicalResourceId: physicalId,
            Status: 'FAILED',
            RequestId: event.RequestId,
            StackId: event.StackId,
            LogicalResourceId: event.LogicalResourceId,
            Reason: `failed with error ${e}`,
        };
    }
};

const onDelete = (event: CloudFormationCustomResourceDeleteEvent): CloudFormationCustomResourceResponse => {
    // If multiple resources are created this cant be hardcoded
    const physicalId = event.PhysicalResourceId;
    console.info(`delete resource ${physicalId}`);

    return {
        PhysicalResourceId: physicalId,
        Status: 'SUCCESS',
        RequestId: event.RequestId,
        StackId: event.StackId,
        LogicalResourceId: event.LogicalResourceId,
        Reason: `deleted resource successfully`,
    };
};

const onUpdate = (event: CloudFormationCustomResourceUpdateEvent): CloudFormationCustomResourceResponse => {
    // If multiple resources are created this cant be hardcoded
    const physicalId = event.PhysicalResourceId;
    console.info(`update resource ${physicalId}, no actions`);

    return {
        PhysicalResourceId: physicalId,
        Status: 'SUCCESS',
        RequestId: event.RequestId,
        StackId: event.StackId,
        LogicalResourceId: event.LogicalResourceId,
        Reason: `updated resource successfully`,
    };
};

export async function handler(event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> {
    console.info({ event });

    switch (event.RequestType) {
        case 'Create':
            return await onCreate(event);
        case 'Update':
            return await onUpdate(event);
        case 'Delete':
            return onDelete(event);
    }

    throw new Error('RequestType is invalid!');
}
