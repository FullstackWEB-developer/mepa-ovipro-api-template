import { EnvironmentWrapper } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TemplateApiResourcesStack } from './api-resources/TemplateApiResourcesStack';
import { AuroraMigratorStack } from './database/aurora-migrator';
import { TemplateApiBaseConstruct } from './template-api';
import { ApiBaseConstruct } from './types/ApiBaseConstruct';
import { addMepaTags } from './utils/tags';

export class Environment extends EnvironmentWrapper {
    /**Defines environmental CDK Stacks. */
    constructor(scope: Construct) {
        super(scope);

        const templateApiResourcesStack = new TemplateApiResourcesStack(this, 'TemplateApiResourcesStack', {
            description: 'Template API resources',
        });

        const templateApiBaseConstruct = new TemplateApiBaseConstruct(this, 'TemplateApiBaseConstruct', {
            description: 'Template API base stack',
        });

        new AuroraMigratorStack(this, 'TemplateAuroraMigratorStack', {
            description: 'Template API Aurora migrator Lambda',
        });

        // Add dependencies on all stacks to shared resources
        [templateApiBaseConstruct].forEach((resource) => {
            if (resource instanceof cdk.Stack) {
                resource.addDependency(templateApiResourcesStack);
            }
            if (resource instanceof ApiBaseConstruct) {
                resource.stacks.forEach((stack) => stack.addDependency(templateApiResourcesStack));
            }
        });

        // Tag all stacks with Mepa-tags
        addMepaTags(this.node.children as Construct[]);
    }
}
