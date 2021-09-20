import * as cdk from '@aws-cdk/core';
import { EnvironmentConstruct, Sc } from '@almamedia/cdk-accounts-and-environments';
import { Tag, Name } from '@almamedia/cdk-tag-and-name';
import { addMepaTags } from './utils/tags';
import { AuroraMigratorStack } from './database/aurora-migrator';
import { ResourceRemovalPolicyTesterAspect } from './utils/policy-aspect/ResourceRemovalPolicyTesterAspect';

export class Environment extends EnvironmentConstruct {
    /**Defines environmental CDK Stacks. */
    constructor(scope: cdk.Construct) {
        super(scope);

        new AuroraMigratorStack(this, 'AuroraMigratorStack', {
            stackName: Name.stack(this, 'AuroraMigratorStack'),
            ...Sc.defineProps(this, 'Aurora migrator Lambda'),
        });

        // Tag all stacks with default tags
        Tag.defaults(this.node.children as cdk.Construct[]);
        // Tag all stacks with Mepa-tags
        addMepaTags(this.node.children as cdk.Construct[]);

        this.node.children
            .filter((construct) => construct instanceof cdk.Stack)
            .forEach((construct) => {
                cdk.Aspects.of(construct).add(new ResourceRemovalPolicyTesterAspect());
            });
    }
}
