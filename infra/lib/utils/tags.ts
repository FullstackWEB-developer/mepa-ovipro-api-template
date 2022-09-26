import { AC } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export const addAdditionalTagsToResource = (resource: Construct): void => {
    cdk.Tags.of(resource).add('Service', AC.getAccountConfig(resource, 'service'));
    // Type can only be prod or test
    const type = AC.isProd(resource) ? 'prod' : 'test';
    cdk.Tags.of(resource).add('Type', type);
};

/**
    Add additional Tags to a resource

    We have a bit different tag-policy in Mepa compared to rest of Alma,
    so tag-and-name package is not sufficient enough for us

    @param resources CDK constructs
*/
export const addMepaTags = (resources: Construct[]): void => {
    resources.forEach((resource) => {
        addAdditionalTagsToResource(resource);
    });
};
