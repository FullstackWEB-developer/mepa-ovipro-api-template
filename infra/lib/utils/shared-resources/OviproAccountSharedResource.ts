import * as cdk from '@aws-cdk/core';
import { CrossRegionParameter } from '@almamedia/cdk-cross-region-parameter';
import { pascalCase } from 'change-case';
import * as ssm from '@aws-cdk/aws-ssm';
import { Ac } from '@almamedia/cdk-accounts-and-environments';
import { SharedResourceType } from './types';

const createParameterName = (scope: cdk.Construct, resourceType: SharedResourceType) =>
    `/${Ac.getConfig(scope, 'service')}/${resourceType}`;

const createCrossRegionParameterName = (scope: cdk.Construct, resourceType: SharedResourceType) => {
    // CROSS_REGION/us-east-1/EXAMPLE -> [, 'us-east-1', 'EXAMPLE']
    const [, region, name] = resourceType.toString().split('/');
    return `/${Ac.getConfig(scope, 'service')}/${region}/${name}`;
};

/**
 * Custom construct for exporting and importing shared asset and resource data to/from
 * SSM Parameter Store.
 *
 * Use these when importing or exporting existing resources for cross-stack referencing
 */
export class OviproAccountSharedResource extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
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
    ): void {
        const constructName = `${pascalCase(resource)}StringParameter`;
        if (!resource.includes('CROSS_REGION')) {
            const parameter = new ssm.StringParameter(this, constructName, {
                // Hard-coded parameter name, will be used in other projects and repositories
                parameterName: createParameterName(this, resource),
                stringValue: stringValue,
            });
            parameter.applyRemovalPolicy(removalPolicy || cdk.RemovalPolicy.DESTROY);
        } else {
            new CrossRegionParameter(this, constructName, {
                region: 'eu-west-1', // hardcoded
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
        if (!resource.includes('CROSS_REGION')) {
            return ssm.StringParameter.valueFromLookup(this, createParameterName(this, resource));
        } else {
            return ssm.StringParameter.valueFromLookup(this, createCrossRegionParameterName(this, resource));
        }
    }
}
