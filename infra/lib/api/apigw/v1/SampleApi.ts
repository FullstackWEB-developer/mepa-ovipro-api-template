import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import { VersionedOpenApi } from '../../../constructs/VersionedOpenApi';

interface SampleApiGwStackProps extends cdk.StackProps {
    sample: { getFunction: lambda.IFunction };
}

export class SampleApi extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: SampleApiGwStackProps) {
        super(scope, id);

        const { sample } = props;

        new VersionedOpenApi(this, 'SampleApiV1', {
            openApiDefinitionFileName: 'realty-api-v1.yaml',
            apigatewayIntegrations: {
                '/plotProperties/{realtyId}': {
                    get: { fn: sample.getFunction },
                    post: { fn: sample.getFunction },
                    put: { fn: sample.getFunction },
                },
            },
            apiName: 'sample',
            version: 1,
        });
    }
}
