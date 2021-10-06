import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as lambda from '@aws-cdk/aws-lambda';
import { SampleApi } from './apigw/v1/SampleApi';
import { ApiLambda, Props as LambdaProps } from './ApiLambda';
import { SharedResourceType } from '../utils/shared-resources/types';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';

/**
 * API stack for lambdas and API Gateway resources.
 */
export class ApiStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        /*
        Requires:
            auroraCluster: rds.IServerlessCluster;
            auroraReadWriteCredentialsSecret: sm.ISecret;
        */

        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');

        const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);

        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(this, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });

        let databaseSecretArn = sharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
        if (databaseSecretArn.includes('dummy-value-for-')) {
            databaseSecretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
        }

        const secret = sm.Secret.fromSecretCompleteArn(this, 'SharedDatabaseSecret', databaseSecretArn);

        const defaultLambdaProps: Omit<LambdaProps, 'description' | 'code'> = {
            relationalDataSource: database,
            relationalDataSourceReadWriteCredentialsSecret: secret,
            memorySize: 1024,
            environment: {
                DB_NAME: 'ovipro',
                MODULE_NAME: 'SampleAPI',
                API_VERSION: 'v1',
                METHOD: 'GET',
                SERVICE_NAME: 'UNDEFINED',
                DB_LOGGING_ENABLED: 'true',
                SAMPLE_LOG_DEBUG_RATE: '100',
            },
        };

        const { handler: sampleHandler } = new ApiLambda(this, 'SampleGet', {
            ...defaultLambdaProps,
            environment: {
                ...defaultLambdaProps.environment,
                SERVICE_NAME: 'sample',
            },
            description: 'Sample API with GET /plotProperties',
            code: lambda.Code.fromAsset('dist/functions/sample/api/handlers'),
        });

        new SampleApi(this, 'SampleApi', {
            sample: { getFunction: sampleHandler },
        });
    }
}
