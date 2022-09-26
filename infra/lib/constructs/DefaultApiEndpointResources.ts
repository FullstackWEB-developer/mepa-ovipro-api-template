import { SmartStack } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
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
     * Security group for endpoint lambdas
     */
    apiEndpointLambdaSecurityGroup: ec2.ISecurityGroup;

    /**
     * Environment param names
     */
    environmentParams?: { [key: string]: string };

    /**
     * Timeout for the lambda
     */
    timeout?: cdk.Duration;
}

/**
 * Default resources for API endpoint stacks
 */
export class DefaultApiEndpointResources extends Construct {
    public readonly handler: lambda.IFunction;

    constructor(scope: SmartStack, id: string, props: DefaultApiEndpointResourcesProps) {
        super(scope, id);

        const {
            description,
            entry,
            serviceName,
            method,
            version,
            apiEndpointLambdaSecurityGroup,
            environmentParams,
            timeout,
        } = props;

        /*
        Requires:
            auroraCluster: rds.IServerlessCluster;
            auroraReadWriteCredentialsSecret: sm.ISecret;
        */

        const sharedResource = new OviproEnvironmentSharedResource(scope, 'SharedResource');

        const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);

        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(scope, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });

        let databaseSecretArn = sharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
        if (databaseSecretArn.includes('dummy-value-for-')) {
            databaseSecretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
        }

        const secret = sm.Secret.fromSecretCompleteArn(scope, 'SharedDatabaseSecret', databaseSecretArn);

        const defaultLambdaProps: Omit<LambdaProps, 'description' | 'entry'> = {
            relationalDataSource: database,
            relationalDataSourceReadWriteCredentialsSecret: secret,
            securityGroup: apiEndpointLambdaSecurityGroup,
            memorySize: 1024,
            timeout: timeout || cdk.Duration.seconds(10),
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
