import { AC } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Specific tags to assign to different resources.
 * There should be a very limited number of different tags in use.
 */
export enum OptionalMetaTag {
    /** Assign repository-unique application tags to resources for queryability. */
    APPLICATION = 'Application',
    NAME = 'Name',
}

export const addAdditionalTagsToResource = (resource: Construct): void => {
    cdk.Tags.of(resource).add('Service', AC.getAccountConfig(resource, 'service'));
    // Type can only be prod or test
    const type = AC.isProd(resource) ? 'prod' : 'test';
    cdk.Tags.of(resource).add('Type', type);

    cdk.Tags.of(resource).add('Module', 'RealtyAPI');
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

/**
 * Add optional typed key-value tags to given resources.
 * Tags are used to group resources. Simple ASCII values only, please.
 */
export const addOptionalTag = (resources: Construct[], type: OptionalMetaTag, value: string): void => {
    resources.forEach((resource) => cdk.Tags.of(resource).add(type, value));
};
