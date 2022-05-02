import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ApiEndpointStack } from '../constructs/ApiEndpointStack';
import { EndpointStacksConstructProps } from '../constructs/types/EndpointStacksConstructProps';

export class SampleEndpointStacks extends Construct {
    public readonly getHandler: lambda.IFunction;
    public readonly postHandler: lambda.IFunction;
    public readonly putHandler: lambda.IFunction;
    public readonly deleteHandler: lambda.IFunction;

    constructor(scope: Construct, id: string, props: EndpointStacksConstructProps) {
        super(scope, id);

        const { handler: getHandler } = new ApiEndpointStack(this, 'EstatePropertiesGet', {
            apiEndpointProps: {
                entry: 'functions/sample/handlers/index.ts',
                serviceName: 'sampleGet',
                version: 1,
                method: 'get',
                apiEndpointLambdaSecurityGroup: props.apiEndpointLambdaSecurityGroup,
                description: 'Sample API with GET /estateProperties/{realtyId}',
            },
            stackProps: { summary: 'Sample API with GET /estateProperties/{realtyId}' },
        });

        this.getHandler = getHandler;
    }
}
