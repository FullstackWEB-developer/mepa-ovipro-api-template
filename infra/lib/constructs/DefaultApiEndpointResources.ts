import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../utils/shared-resources/types';
import { ApiLambda, Props as LambdaProps } from './ApiLambda';

export interface DefaultApiEndpointResourcesProps {
    /**
     * Description for lambda function
     *
     * @example 'Realty API with GET /estateProperties/{realtyId}'
     */
    description: string;
    /**
     * Location of lambda code
     *
     * @example 'functions/api/handlers/estateProperties/get.ts'
     */
    entry: string;
    /**
     * Service name
     *
     * @example 'estateProperties'
     */
    serviceName: string;
    /**
     * Method of API endpoint
     *
     * @example 'get'
     */
    method: string;
    /**
     * API version
     *
     * @example 1
     */
    version: number;

    /**
     * Environment param names
     */
    environmentParams?: { [key: string]: string };

    /**
     * Timeout for the lambda
     */
    timeout?: cdk.Duration;

    /**
     * Set Lambda VPC. Only define this when you need to access VPC resources otherwise inaccessible via a gateway.
     */
    vpc?: ec2.IVpc;

    /**
     * Lambda security groups. By default uses Realty API default SG.
     */
    securityGroups?: ec2.ISecurityGroup[];
}

/**
 * Default resources for API endpoint stacks
 */
export class DefaultApiEndpointResources extends Construct {
    public readonly handler: lambda.IFunction;

    constructor(scope: cdk.Stack, id: string, props: DefaultApiEndpointResourcesProps) {
        super(scope, id);

        const { description, entry, serviceName, method, version, environmentParams, timeout, vpc, securityGroups } =
            props;

        /*
        Requires:
            auroraCluster: rds.IServerlessCluster;
            auroraReadWriteCredentialsSecret: sm.ISecret;
        */

        const environmentSharedResource = new OviproEnvironmentSharedResource(scope, 'SharedResource');

        const clusterIdentifier = environmentSharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);

        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(scope, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });

        let databaseSecretArn = environmentSharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
        if (databaseSecretArn.includes('dummy-value-for-')) {
            databaseSecretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
        }

        const secret = sm.Secret.fromSecretCompleteArn(scope, 'SharedDatabaseSecret', databaseSecretArn);

        const defaultLambdaProps: Omit<LambdaProps, 'description' | 'entry'> = {
            relationalDataSource: database,
            relationalDataSourceReadWriteCredentialsSecret: secret,
            memorySize: 1024,
            timeout: timeout || cdk.Duration.seconds(10),
            vpc,
            securityGroups,
            environment: {
                DB_NAME: 'ovipro',
                MODULE_NAME: 'RealtyAPI',
                API_VERSION: `v${version}`,
                METHOD: method.toUpperCase(),
                SERVICE_NAME: 'UNDEFINED',
                DB_LOGGING_ENABLED: 'true',
                SAMPLE_LOG_DEBUG_RATE: '100',
                ...environmentParams,
            },
        };

        const { handler } = new ApiLambda(scope, `${scope.stackName}Function`, {
            ...defaultLambdaProps,
            environment: {
                ...defaultLambdaProps.environment,
                SERVICE_NAME: serviceName,
            },
            description,
            entry,
        });

        this.handler = handler;
    }
}
