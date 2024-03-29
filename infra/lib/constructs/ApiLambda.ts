import { AC, EC } from '@alma-cdk/project';
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
import { externalModules } from '../utils/bundling';
import { addOptionalTag, OptionalMetaTag } from '../utils/tags';
import { SharedLambdaResources } from './SharedLambdaResources';

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
    /** Lambda environment properties */
    environment: EnvironmentProps;
    /**
     * Additional security groups
     */
    securityGroups?: ec2.ISecurityGroup[];
    /**
     * Lambda VPC. Only set this when you need the Lambda to access resources inaccessible via a gateway.
     */
    vpc?: ec2.IVpc;
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
            vpc,
            securityGroups,
        } = props;

        const environmentName = pascalCase(EC.getName(this));
        const functionName = `${environmentName}${cdk.Stack.of(this).node.id}`.slice(0, 64);

        const { sharedDependenciesLambdaLayer, apiEndpointLambdaSecurityGroup } = new SharedLambdaResources(
            this,
            'SharedLambdaResources',
        );

        const handler = new nodejslambda.NodejsFunction(this, id, {
            handler: 'handler',
            functionName,
            entry,
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.NODEJS_16_X,
            timeout: timeout || Duration.seconds(10),
            description,
            memorySize: memorySize || 1024,
            environment: {
                DB_CLUSTER_ARN: auroraCluster?.clusterArn || '',
                READ_WRITE_SECRET_ARN: auroraReadWriteCredentialsSecret?.secretArn || '',
                ENVIRONMENT: environmentName,
                ...environment,
            },
            depsLockFilePath: 'package-lock.json',
            bundling: {
                externalModules: externalModules,
                minify: true,
                /*
                    There was issues with TypeORM without this
                    https://almamedia.atlassian.net/browse/OVIPROAPI-1727
                    https://almamedia.atlassian.net/browse/OVIPROAPI-1678
                 */
                keepNames: true,
            },
            vpc,
            layers: [sharedDependenciesLambdaLayer],
            tracing: lambda.Tracing.ACTIVE,
            securityGroups: securityGroups ? securityGroups : [apiEndpointLambdaSecurityGroup],
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
        // For cost optimization, create alarms only in stable envs
        if (EC.isStable(this) || EC.isVerification(this) || AC.isMock(this)) {
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
        }

        addOptionalTag([handler], OptionalMetaTag.NAME, functionName);
        this.handler = handler;
    }
}
