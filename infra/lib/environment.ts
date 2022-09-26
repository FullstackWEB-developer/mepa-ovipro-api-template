import { EnvironmentWrapper } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuroraMigratorStack } from './database/aurora-migrator';
import { ResourceRemovalPolicyTesterAspect } from './utils/policy-aspect/ResourceRemovalPolicyTesterAspect';
import { addMepaTags } from './utils/tags';

export class Environment extends EnvironmentWrapper {
    /**Defines environmental CDK Stacks. */
    constructor(scope: Construct) {
        super(scope);

        new AuroraMigratorStack(this, 'TemplateAuroraMigratorStack', {
            description: 'Realty API Aurora migrator Lambda',
        });

        // Tag all stacks with Mepa-tags
        addMepaTags(this.node.children as Construct[]);

        this.node.children
            .filter((construct) => construct instanceof cdk.Stack)
            .forEach((construct) => {
                cdk.Aspects.of(construct).add(new ResourceRemovalPolicyTesterAspect());
            });
    }
}
