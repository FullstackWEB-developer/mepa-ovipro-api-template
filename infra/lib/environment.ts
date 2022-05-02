import { ProjectStack } from '@almamedia-open-source/cdk-project-stack';
import { EnvironmentConstruct } from '@almamedia-open-source/cdk-project-target';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AuroraMigratorStack } from './database/aurora-migrator';
import { ResourceRemovalPolicyTesterAspect } from './utils/policy-aspect/ResourceRemovalPolicyTesterAspect';
import { addMepaTags } from './utils/tags';

export class Environment extends EnvironmentConstruct {
    /**Defines environmental CDK Stacks. */
    constructor(scope: Construct) {
        super(scope);

        new AuroraMigratorStack(this, 'TemplateAuroraMigratorStack', {
            summary: 'Aurora migrator Lambda',
        });

        // Tag all stacks with Mepa-tags
        addMepaTags(this.node.children as Construct[]);

        this.node.children
            .filter((construct) => construct instanceof ProjectStack)
            .forEach((construct) => {
                cdk.Aspects.of(construct).add(new ResourceRemovalPolicyTesterAspect());
            });
    }
}
