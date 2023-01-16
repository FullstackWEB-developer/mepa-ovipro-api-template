import { EC, SmartStack } from '@alma-cdk/project';
import { StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';
import { DefaultVpc } from '../default-resources/shared/vpc';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../utils/shared-resources/types';

/**
 * Feature environments import stagings resources
 *
 * Cloudformation is unable to delete security groups randomly, so keeping a somewhat stable
 * security group at least in staging-env is a good idea
 */
export class TemplateApiResourcesStack extends SmartStack {
    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');
        const environmentSharedResource = new OviproEnvironmentSharedResource(this, 'EnvSharedResource');

        const sharedLambdaDependenciesLambdaLayer = new lambda.LayerVersion(
            this,
            `${pascalCase(EC.getName(this))}TemplateApiDependencies`,
            {
                code: lambda.Code.fromAsset('functions/layers/shared-dependencies/'),
                compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
                description: 'Shared node dependencies for lambda functions',
            },
        );

        environmentSharedResource.export(
            SharedResourceType.TEMPLATE_API_SHARED_DEPENDENCIES_LAYER_VERSION_ARN,
            sharedLambdaDependenciesLambdaLayer.layerVersionArn,
        );

        if (!EC.isFeature(this)) {
            const apiEndpointLambdaSecurityGroup = new ec2.SecurityGroup(this, 'TemplateApiEndpointLambdaSg', {
                vpc,
                description: 'Shared securitygroup for template api lambdas. We need this to limit ENI usage',
            });

            environmentSharedResource.export(
                SharedResourceType.TEMPLATE_API_ENDPOINT_LAMBDA_SECURITY_GROUP_ID,
                apiEndpointLambdaSecurityGroup.securityGroupId,
            );
        }
    }
}
