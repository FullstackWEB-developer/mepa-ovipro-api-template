import { AC, EC } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../utils/shared-resources/types';

export interface Props {
    /** Lambda code asset location as string. */
    entry: string;
    /** Lambda description */
    description: string;
    /**
     * Lambda timeout in seconds.
     * @defaultValue 30
     */
    timeout?: cdk.Duration;
    /**
     * Lambda memory in MB.
     * @defaultValue 1024
     */
    memorySize?: number;
    /**
     * Lambda Cloudwatch log retention period.
     * @defaultValue 1 month
     */
    logRetention?: logs.RetentionDays;
    /** Lambda environment properties */
    environment: EnvironmentProps;
    /**
     * Securitygroup for the function
     *
     * Same for every other function in an API
     */
    securityGroup?: ec2.ISecurityGroup;
    /**
     * Type of x-ray tracing for lambda.
     * Default ACTIVE
     * For example lambda listening SQS need custom x-ray logic in handler
     */
    tracingType?: lambda.Tracing;
    /**
     * Limits amount of concurrent lambda executions
     */
    reservedConcurrencyLimit?: number;
    /**
     * Allow lambda to access to RDS. Gives readWrite permissions to ovipro db and set required environment variables
     */
    allowAccessToRds?: boolean;

    dbLoggingEnabled?: 'true' | 'false';

    /**
     * Log retention role
     */
    logRetentionRole: iam.IRole;
}

/**
 * Handler-specific additional environment properties as a list of key-value pairs.
 */
interface EnvironmentProps {
    MODULE_NAME: 'RealtyAPI' | 'MarketingAPI';
    [key: string]: string;
}

/**
 * Basic Lambda construct. Has no permissions set by default.
 * This can be used when ApiLambda shouldn't be used. For example when Lambda is triggered by something else than ApiGW.
 */
export class DefaultLambda extends Construct {
    public readonly handler: lambda.IFunction;

    /** Creates a sample lambda */
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const {
            environment,
            entry,
            description,
            timeout,
            memorySize,
            logRetention,
            securityGroup,
            tracingType,
            reservedConcurrencyLimit,
            allowAccessToRds,
            dbLoggingEnabled,
            logRetentionRole,
        } = props;

        const environmentName = pascalCase(EC.getName(this));
        const environmentSharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');

        const environmentForRDSAccess = {
            DB_NAME: 'ovipro',
            READ_WRITE_SECRET_ARN: '',
            DB_CLUSTER_ARN: '',
            DB_LOGGING_ENABLED: dbLoggingEnabled ? dbLoggingEnabled : 'false',
        };

        if (allowAccessToRds) {
            const clusterIdentifier = environmentSharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);

            const database = rds.ServerlessCluster.fromServerlessClusterAttributes(this, 'DefaultServerlessCluster', {
                clusterIdentifier,
            });

            let databaseSecretArn = environmentSharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
            if (databaseSecretArn.includes('dummy-value-for-')) {
                databaseSecretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
            }

            const secret = sm.Secret.fromSecretCompleteArn(this, 'SharedDatabaseSecret', databaseSecretArn);

            environmentForRDSAccess.DB_CLUSTER_ARN = database.clusterArn;
            environmentForRDSAccess.READ_WRITE_SECRET_ARN = secret.secretArn;
        }

        const handler = new nodejslambda.NodejsFunction(this, id, {
            handler: 'handler',
            entry,
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: timeout || cdk.Duration.seconds(30),
            description,
            memorySize: memorySize || 1024,
            logRetention: logRetention || logs.RetentionDays.ONE_MONTH,
            logRetentionRole,
            environment: {
                ENVIRONMENT: environmentName,
                SERVICE_NAME: pascalCase(id),
                ...(allowAccessToRds && environmentForRDSAccess),
                ...environment,
            },
            reservedConcurrentExecutions: reservedConcurrencyLimit ? reservedConcurrencyLimit : undefined,
            depsLockFilePath: 'package-lock.json',
            bundling: {
                externalModules: ['aws-sdk', 'pg-native'],
                minify: true,
                /*
                    There was issues with TypeORM without this
                    https://almamedia.atlassian.net/browse/OVIPROAPI-1727
                    https://almamedia.atlassian.net/browse/OVIPROAPI-1678
                 */
                keepNames: true,
            },
            tracing: tracingType ? tracingType : lambda.Tracing.ACTIVE,
            securityGroups: securityGroup ? [securityGroup] : undefined,
        });
        this.handler = handler;

        if (allowAccessToRds) {
            /**
             * Allows reading secret value
             */
            handler.addToRolePolicy(
                new iam.PolicyStatement({
                    resources: [environmentForRDSAccess.READ_WRITE_SECRET_ARN],
                    actions: ['secretsmanager:GetSecretValue'],
                }),
            );

            /**
             * Allows querying the database data-api
             */
            handler.addToRolePolicy(
                new iam.PolicyStatement({
                    resources: [environmentForRDSAccess.DB_CLUSTER_ARN],
                    actions: [
                        'rds-data:BatchExecuteStatement',
                        'rds-data:BeginTransaction',
                        'rds-data:CommitTransaction',
                        'rds-data:ExecuteStatement',
                        'rds-data:RollbackTransaction',
                    ],
                }),
            );
        }

        // For cost optimization, create alarms only in stable envs
        if (EC.isStable(this) || AC.isMock(this)) {
            /**
             * Added error metric for future use in Dashboard
             */
            handler.metricErrors({
                statistic: 'avg',
                period: cdk.Duration.minutes(1),
                label: 'Lambda failure rate',
            });

            /**
             * Added alarm to Function if
             */
            handler.metricErrors().createAlarm(this, 'Alarm', {
                threshold: 100,
                evaluationPeriods: 2,
            });
        }

        this.handler = handler;
    }
}
