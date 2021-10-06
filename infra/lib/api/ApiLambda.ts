import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as rds from '@aws-cdk/aws-rds';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as logs from '@aws-cdk/aws-logs';
import { Name } from '@almamedia/cdk-tag-and-name';
import { Duration } from '@aws-cdk/core';
import { DefaultVpc } from '../default-resources/shared/vpc';
import { pascalCase } from 'change-case';
import { Ec } from '@almamedia/cdk-accounts-and-environments';

export interface Props extends cdk.StackProps {
    /** Lambda Aurora data source. Lambda is given data access to this. */
    relationalDataSource?: rds.IServerlessCluster;
    /** Lambda Aurora data source secret. Lambda is given read access to this. */
    relationalDataSourceReadWriteCredentialsSecret?: sm.ISecret;
    /** Lambda code asset location. */
    code: lambda.Code;
    /** Lambda description */
    description: string;
    /**
     * Lambda timeout in seconds.
     * @defaultValue 10
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
}

/**
 * Handler-specific additional environment properties as a list of key-value pairs.
 */
interface EnvironmentProps {
    SERVICE_NAME: string;
    MODULE_NAME: string;
    METHOD: string;
    API_VERSION: string;
    DB_LOGGING_ENABLED: 'true' | 'false';
    [key: string]: string;
}

/**
 * Basic API Lambda construct. Has read-write DB access and default parameterization.
 */
export class ApiLambda extends cdk.Construct {
    public readonly handler: lambda.IFunction;

    /** Creates a sample lambda */
    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id);

        const {
            relationalDataSourceReadWriteCredentialsSecret: auroraReadWriteCredentialsSecret,
            relationalDataSource: auroraCluster,
            environment,
            code,
            description,
            timeout,
            memorySize,
            logRetention,
        } = props;

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');

        const environmentName = pascalCase(Ec.getName(this));

        const handler = new lambda.Function(this, id, {
            functionName: Name.withProject(this, id),
            handler: 'index.handler',
            code,
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: timeout || Duration.seconds(10),
            vpc,
            description,
            memorySize: memorySize || 1024,
            logRetention: logRetention || logs.RetentionDays.ONE_MONTH,
            environment: {
                NODE_OPTIONS: '--enable-source-maps', // Required to use sourcemaps!
                DB_CLUSTER_ARN: auroraCluster?.clusterArn || '',
                READ_WRITE_SECRET_ARN: auroraReadWriteCredentialsSecret?.secretArn || '',
                ENVIRONMENT: environmentName,
                ...environment,
            },
            tracing: lambda.Tracing.ACTIVE,
        });
        this.handler = handler;

        if (auroraCluster && auroraReadWriteCredentialsSecret) {
            /**
             * Allows reading secret value
             */
            handler.addToRolePolicy(
                new iam.PolicyStatement({
                    resources: [auroraReadWriteCredentialsSecret.secretArn],
                    actions: ['secretsmanager:GetSecretValue'],
                }),
            );

            /**
             * Allows querying the database data-api
             */
            handler.addToRolePolicy(
                new iam.PolicyStatement({
                    resources: [auroraCluster.clusterArn],
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

        /**
         * Added error metric for future use in Dashboard
         */
        handler.metricErrors({
            statistic: 'avg',
            period: Duration.minutes(1),
            label: 'Lambda failure rate',
        });

        /**
         * Added alarm to Function if
         */
        handler.metricErrors().createAlarm(this, 'Alarm', {
            threshold: 100,
            evaluationPeriods: 2,
        });

        this.handler = handler;
    }
}
