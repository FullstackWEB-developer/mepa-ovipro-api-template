import * as cdk from '@aws-cdk/core';
import { pascalCase } from 'change-case';
import * as ssm from '@aws-cdk/aws-ssm';
import { Ac, Ec } from '@almamedia/cdk-accounts-and-environments';
import { SharedResourceType } from './types';

const createParameterName = (scope: cdk.Construct, resourceType: SharedResourceType) =>
    `/${pascalCase(Ec.getName(scope))}/${Ac.getConfig(scope, 'service')}/shared-resources/${resourceType}`;

/**
 * Custom construct for exporting and importing shared asset and resource data to/from
 * SSM Parameter Store.
 *
 * Use these when importing or exporting existing resources for cross-stack referencing
 */
export class OviproEnvironmentSharedResource extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
    }

    /**
     * Export string data as StringParameter
     *
     * @param resource
     * @param stringValue
     */
    export(resource: SharedResourceType, stringValue: string): void {
        const parameter = new ssm.StringParameter(this, `${pascalCase(resource)}StringParameter`, {
            // Hard-coded parameter name, will be used in other projects and repositories
            parameterName: createParameterName(this, resource),
            stringValue: stringValue,
        });

        parameter.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
    }

    /**
     * Import StringParamater string value
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
