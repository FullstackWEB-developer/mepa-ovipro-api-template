import * as cdk from '@aws-cdk/core';
import { pascalCase } from 'change-case';
import * as ssm from '@aws-cdk/aws-ssm';
import { Ac } from '@almamedia/cdk-accounts-and-environments';
import { SharedResourceType } from './types';
import { RemovalPolicy } from '@aws-cdk/core';

const resourceTypeAsString = (resourceType: SharedResourceType) => SharedResourceType[resourceType];

const createParameterName = (scope: cdk.Construct, resourceType: SharedResourceType) =>
    `/${Ac.getConfig(scope, 'service')}/${resourceTypeAsString(resourceType)}`;

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
    export(resource: SharedResourceType, stringValue: string, removalPolicy?: RemovalPolicy): void {
        const parameter = new ssm.StringParameter(
            this,
            `${pascalCase(resourceTypeAsString(resource))}StringParameter`,
            {
                // Hard-coded parameter name, will be used in other projects and repositories
                parameterName: createParameterName(this, resource),
                stringValue: stringValue,
            },
        );

        parameter.applyRemovalPolicy(removalPolicy || RemovalPolicy.DESTROY);
    }

    /**
     * Import StringParameter string value
     *
     * Uses StringParameter.valueFromLookup-function, which should work during synth
     *
     * @param resource
     */
    import(resource: SharedResourceType): string {
        const stringValue = ssm.StringParameter.valueFromLookup(this, createParameterName(this, resource));

        return stringValue;
    }
}
