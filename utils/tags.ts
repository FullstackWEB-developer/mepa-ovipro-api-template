import cdk = require('@aws-cdk/core');
import { Ac } from '@almamedia/cdk-accounts-and-environments';

export const addAdditionalTagsToResource = (resource: cdk.Construct): void => {
    cdk.Tags.of(resource).add('Service', Ac.getConfig(resource, 'service'));
    // Type can only be prod or test
    const type = Ac.isProd(resource) ? 'prod' : 'test';
    cdk.Tags.of(resource).add('Type', type);
};

/**
    Add additional Tags to a resource

    We have a bit different tag-policy in Mepa compared to rest of Alma,
    so tag-and-name package is not sufficient enough for us

    @param resources CDK constructs
*/
export const addMepaTags = (resources: cdk.Construct[]): void => {
    resources.forEach((resource) => {
        addAdditionalTagsToResource(resource);
    });
};
