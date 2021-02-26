import * as cdk from '@aws-cdk/core';
import { EnvironmentConstruct, Sc } from '@almamedia/cdk-accounts-and-environments';
import { Tag, Name } from '@almamedia/cdk-tag-and-name';
import { DefaultVpc } from './default-resources/vpc';
import { addMepaTags } from './utils/tags';
import { SampleStack } from './sample-stack';

export class Environment extends EnvironmentConstruct {
    /**Defines environmental CDK Stacks. */
    constructor(scope: cdk.Construct) {
        super(scope);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');

        new SampleStack(this, 'SampleStack', {
            stackName: Name.stack(this, 'Alb'),
            ...Sc.defineProps(this, 'Alb stack for OviPRO infrastructure'),
            vpc,
        });

        // Tag all stacks with default tags
        Tag.defaults(this.node.children as cdk.Construct[]);
        // Tag all stacks with Mepa-tags
        addMepaTags(this.node.children as cdk.Construct[]);
    }
}
