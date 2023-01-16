import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as triggers from 'aws-cdk-lib/triggers';
import { Construct } from 'constructs';

/**
 * Custom trigger function props extending from NodejsFunctionProps and TriggerOptions. AWS TriggerFunction
 * extends from the standard Lambda function.
 */
export interface TriggerFunctionProps extends nodejslambda.NodejsFunctionProps, triggers.TriggerOptions {}

/**
 * This is similar to the AWS CDK TriggerFunction construct but for NodejsFunction.
 * See https://docs.aws.amazon.com/cdk/api/v1/docs/aws-cdk-lib_triggers.TriggerFunction.html
 */
export class NodejsTriggerFunction extends nodejslambda.NodejsFunction implements triggers.ITrigger {
    public readonly trigger: triggers.Trigger;

    constructor(scope: Construct, id: string, props: TriggerFunctionProps) {
        super(scope, id, props);

        this.trigger = new triggers.Trigger(this, 'Trigger', {
            ...props,
            handler: this,
        });
    }

    executeAfter(...scopes: Construct[]): void {
        this.trigger.executeAfter(...scopes);
    }

    executeBefore(...scopes: Construct[]): void {
        this.trigger.executeBefore(...scopes);
    }
}
