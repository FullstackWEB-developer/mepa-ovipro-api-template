import { SmartStack } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { TemplateApi } from './apigw/v1/TemplateApi';

interface Props extends cdk.StackProps {
    templateGet: lambda.IFunction;
}

/**
 * API stack for Template API lambdas and API Gateway resources.
 */
export class TemplateApiStack extends SmartStack {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        const { templateGet } = props;

        new TemplateApi(this, 'TemplateApi', {
            template: {
                getFunction: templateGet,
            },
        });
    }
}
