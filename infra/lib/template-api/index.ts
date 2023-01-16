import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { TemplateStacks } from '../endpoints/template';
import { ApiBaseConstruct } from '../types/ApiBaseConstruct';
import { TemplateApiStack } from './TemplateApiStack';

interface Props extends cdk.StackProps {}

/**
 * Base construct for Template API lambdas and API Gateway resources.
 */
export class TemplateApiBaseConstruct extends ApiBaseConstruct {
    public readonly stacks: cdk.Stack[];

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const { getHandler: templateGet } = new TemplateStacks(this, 'TemplateStacks');

        const api = new TemplateApiStack(this, 'TemplateApiStack', {
            templateGet,
            description: 'Template API related resources',
        });

        this.stacks = [api, templateGet].map((resource) => cdk.Stack.of(resource));
    }
}
