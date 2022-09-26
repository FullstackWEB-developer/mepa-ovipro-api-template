import { AC, EC } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';
import { SharedResourceType } from './types';

const createParameterName = (scope: Construct, resourceType: SharedResourceType) =>
    `/${pascalCase(EC.getName(scope))}/${AC.getAccountConfig(scope, 'service')}/shared-resources/${resourceType}`;

/**
 * Custom construct for exporting and importing shared asset and resource data to/from
 * SSM Parameter Store.
 *
 * Use these when importing or exporting existing resources for cross-stack referencing
 */
export class OviproEnvironmentSharedResource extends Construct {
    constructor(scope: Construct, id: string) {
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

        if (stringValue.includes('dummy-value-for-') && resource.toString().indexOf('_ARN')) {
            switch (resource) {
                case SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN:
                    return 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
                default:
                    return stringValue;
            }
        }

        return stringValue;
    }
}
