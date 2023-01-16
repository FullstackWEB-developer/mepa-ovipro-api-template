import { AC, EC } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';
import { SharedResourceType } from './types';

const createParameterName = (
    scope: Construct,
    resourceType: SharedResourceType,
    useStagingEnvironmentValue?: boolean,
) =>
    `/${useStagingEnvironmentValue ? 'Staging' : pascalCase(EC.getName(scope))}/${AC.getAccountConfig(
        scope,
        'service',
    )}/shared-resources/${resourceType}`;

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
     * @param useStagingEnvironmentValue
     * @param lookup by default lookup value during synth, set to false if value is needed during deploy. Use with caution!
     */
    import(resource: SharedResourceType, useStagingEnvironmentValue = false, lookup = true): string {
        if (!EC.isFeature(this) && useStagingEnvironmentValue) {
            throw new Error("Using staging environment's value only allowed in preview environments");
        }

        const getParameter = !lookup
            ? ssm.StringParameter.valueForStringParameter
            : ssm.StringParameter.valueFromLookup;

        const stringValue = getParameter(this, createParameterName(this, resource, useStagingEnvironmentValue));

        if (stringValue.includes('dummy-value-for-') && resource.toString().indexOf('_ARN')) {
            switch (resource) {
                case SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN:
                    return 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
                case SharedResourceType.TEST_SUPPORT_BUCKET_NAME:
                    return 'test-support-bucket-mock';
                case SharedResourceType.LAMBDA_AUTHORIZER_ARN:
                    return 'arn:aws:lambda:us-east-1:123456789012:function:dummyfunction';
                default:
                    return stringValue;
            }
        }

        return stringValue;
    }

    /**
     * Import StringParameter key value
     */
    importKey(resource: SharedResourceType, useStagingEnvironmentValue: boolean): string {
        return createParameterName(this, resource, useStagingEnvironmentValue);
    }
}
