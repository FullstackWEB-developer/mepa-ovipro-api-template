import { EC } from '@almamedia-open-source/cdk-project-target';
import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';

export interface Props {
    /** Lambda Aurora data source. Lambda is given data access to this. */
    relationalDataSource?: rds.IServerlessCluster;
    /** Lambda Aurora data source secret. Lambda is given read access to this. */
    relationalDataSourceReadWriteCredentialsSecret?: sm.ISecret;
    /** Lambda code asset location as string. */
    entry: string;
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
    /**
     * Securitygroup for the function
     *
     * Same for every other function in an API
     */
    securityGroup: ec2.ISecurityGroup;
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
export class ApiLambda extends Construct {
    public readonly handler: lambda.IFunction;

    /** Creates a sample lambda */
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const {
            relationalDataSourceReadWriteCredentialsSecret: auroraReadWriteCredentialsSecret,
            relationalDataSource: auroraCluster,
            environment,
            entry,
            description,
            timeout,
            memorySize,
            logRetention,
            securityGroup,
        } = props;

        const environmentName = pascalCase(EC.getName(this));

        const handler = new nodejslambda.NodejsFunction(this, id, {
            functionName: `${environmentName}${pascalCase(environment.SERVICE_NAME)}${pascalCase(environment.METHOD)}`,
            handler: 'handler',
            entry,
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: timeout || Duration.seconds(10),
            description,
            memorySize: memorySize || 1024,
            logRetention: logRetention || logs.RetentionDays.ONE_MONTH,
            environment: {
                DB_CLUSTER_ARN: auroraCluster?.clusterArn || '',
                READ_WRITE_SECRET_ARN: auroraReadWriteCredentialsSecret?.secretArn || '',
                ENVIRONMENT: environmentName,
                ...environment,
            },
            depsLockFilePath: 'package-lock.json',
            bundling: {
                externalModules: ['aws-sdk', 'pg-native'],
            },
            tracing: lambda.Tracing.ACTIVE,
            securityGroups: [securityGroup],
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
