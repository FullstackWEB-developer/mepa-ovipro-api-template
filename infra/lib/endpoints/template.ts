import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ApiEndpointStack } from '../constructs/ApiEndpointStack';

export class TemplateStacks extends Construct {
    public readonly getHandler: lambda.IFunction;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const { handler: getHandler } = new ApiEndpointStack(this, 'ResidentialSharesPost', {
            apiEndpointProps: {
                entry: 'functions/api/handlers/template/get.ts',
                serviceName: 'template',
                version: 1,
                method: 'get',
                description: 'Template API with GET /template',
            },
            stackProps: { description: 'Template API with GET /template' },
        });

        this.getHandler = getHandler;
    }
}
