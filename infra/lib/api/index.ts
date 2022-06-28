import { ProjectStack, ProjectStackProps } from '@almamedia-open-source/cdk-project-stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { SampleApi } from './apigw/v1/SampleApi';

interface Props extends ProjectStackProps {
    sampleGet: lambda.IFunction;
}

/**
 * API stack for lambdas and API Gateway resources.
 */
export class SampleApiStack extends ProjectStack {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        const { sampleGet } = props;

        new SampleApi(this, 'SampleApi', {
            sample: {
                getFunction: sampleGet,
            },
        });
    }
}
