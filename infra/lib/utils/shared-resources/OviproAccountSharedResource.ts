import { AC } from '@alma-cdk/project';
import { CrossRegionParameter } from '@almamedia-open-source/cdk-cross-region-parameter';
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';
import { SharedResourceType } from './types';

const createParameterName = (scope: Construct, resourceType: SharedResourceType) =>
    `/${AC.getAccountConfig(scope, 'service')}/${resourceType}`;

const createCrossRegionParameterName = (scope: Construct, resourceType: SharedResourceType) => {
    // CROSS_REGION/us-east-1/EXAMPLE -> [, 'us-east-1', 'EXAMPLE']
    const [, region, name] = resourceType.toString().split('/');
    return `/${AC.getAccountConfig(scope, 'service')}/${region}/${name}`;
};

/**
 * Custom construct for exporting and importing shared asset and resource data to/from
 * SSM Parameter Store.
 *
 * Use these when importing or exporting existing resources for cross-stack referencing
 */
export class OviproAccountSharedResource extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
    }

    /**
     * Export string data as StringParameter
     *
     * @param resource
     * @param stringValue
     * @param removalPolicy, default is DESTROY
     */
    export(
        resource: SharedResourceType,
        stringValue: string,
        removalPolicy?: cdk.RemovalPolicy,
        description?: string,
        region?: string,
    ): void {
        const constructName = `${pascalCase(resource)}StringParameter`;
        if (!resource.includes('CROSS_REGION')) {
            const parameter = new ssm.StringParameter(this, constructName, {
                // Hard-coded parameter name, will be used in other projects and repositories
                parameterName: createParameterName(this, resource),
                stringValue: stringValue,
                description: description,
            });
            parameter.applyRemovalPolicy(removalPolicy || cdk.RemovalPolicy.DESTROY);
        } else {
            new CrossRegionParameter(this, constructName, {
                region: region || 'eu-west-1',
                name: createCrossRegionParameterName(this, resource),
                description: description || '',
                value: stringValue,
            });
        }
    }

    /**
     * Import StringParameter string value
     *
     * Uses StringParameter.valueFromLookup-function, which should work during synth
     *
     * @param resource
     */
    import(resource: SharedResourceType): string {
        let stringValue;

        if (!resource.includes('CROSS_REGION')) {
            stringValue = ssm.StringParameter.valueFromLookup(this, createParameterName(this, resource));
        } else {
            stringValue = ssm.StringParameter.valueFromLookup(this, createCrossRegionParameterName(this, resource));
        }

        if (stringValue.includes('dummy-value-for-') && resource.toString().indexOf('_ARN')) {
            switch (resource) {
                case SharedResourceType.STATIC_MEDIA_S3_BUCKET_ARN:
                    return 'arn:aws:s3:::dummybucketname';
                default:
                    return stringValue;
            }
        }

        return stringValue;
    }
}
