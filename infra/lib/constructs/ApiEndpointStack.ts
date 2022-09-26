import { SmartStack } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { DefaultApiEndpointResources, DefaultApiEndpointResourcesProps } from './DefaultApiEndpointResources';

type Props = {
    stackProps: cdk.StackProps;
    apiEndpointProps: DefaultApiEndpointResourcesProps;
};

/**
 * API stack for lambdas endpoints
 *
 * Needs to be in an own stack to keep stack sizes below 1MB limit
 */
export class ApiEndpointStack extends SmartStack {
    public readonly handler: lambda.IFunction;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props.stackProps);

        const { handler } = new DefaultApiEndpointResources(this, `${this.stackName}DefaultResources`, {
            ...props.apiEndpointProps,
            // The integration timeout is 29 seconds (a hard limit) for all API Gateway integrations
            timeout: cdk.Duration.seconds(25),
        });

        this.handler = handler;
    }
}
