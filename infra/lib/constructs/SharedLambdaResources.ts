import { EC } from '@alma-cdk/project';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../utils/shared-resources/types';

/**
 * Shared resources for lambda functions
 *
 * This construct is made to avoid dependency issues between api stacks and shared resource stacks
 */
export class SharedLambdaResources extends Construct {
    public readonly apiEndpointLambdaSecurityGroup: ec2.ISecurityGroup;
    public readonly sharedDependenciesLambdaLayer: lambda.ILayerVersion;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const environmentSharedResource = new OviproEnvironmentSharedResource(this, 'EnvSharedResource');

        const realtyApiSharedResourceLayerArn = environmentSharedResource.import(
            SharedResourceType.REALTY_API_SHARED_DEPENDENCIES_LAYER_VERSION_ARN,
            undefined,
            false,
        );
        const sharedDependenciesLambdaLayer = lambda.LayerVersion.fromLayerVersionArn(
            this,
            'SharedDependenciesLambdaLayer',
            realtyApiSharedResourceLayerArn,
        );

        this.sharedDependenciesLambdaLayer = sharedDependenciesLambdaLayer;

        if (EC.isFeature(this)) {
            const stagingApiEndpointLambdaSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
                this,
                'ApiEndpointLambdaSecurityGroup',
                environmentSharedResource.import(
                    SharedResourceType.REALTY_API_ENDPOINT_LAMBDA_SECURITY_GROUP_ID,
                    true,
                    false,
                ),
            );

            this.apiEndpointLambdaSecurityGroup = stagingApiEndpointLambdaSecurityGroup;
        } else {
            const apiEndpointLambdaSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
                this,
                'ApiEndpointLambdaSecurityGroup',
                environmentSharedResource.import(
                    SharedResourceType.REALTY_API_ENDPOINT_LAMBDA_SECURITY_GROUP_ID,
                    undefined,
                    false,
                ),
            );

            this.apiEndpointLambdaSecurityGroup = apiEndpointLambdaSecurityGroup;
        }
    }
}
