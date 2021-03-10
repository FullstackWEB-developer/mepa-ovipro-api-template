import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { OviproSharedResource } from '../../../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../../../utils/shared-resources/types';

interface Props extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class DefaultElasticCache extends cdk.Stack {
    public readonly endpointAddress: string;
    public readonly endpointPort: string;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        /**
         * Import shared cluster's address and port
         *
         * Importing cache cluster as a CDK-resource is not possible, unless either
         * we or aws creates a class where lookup-function is implemented
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const endpointAddress = sharedResource.import(SharedResourceType.CACHE_CLUSTER_ENDPOINT_ADDRESS);
        const endpointPort = sharedResource.import(SharedResourceType.CACHE_CLUSTER_ENDPOINT_PORT);

        this.endpointAddress = endpointAddress;
        this.endpointPort = endpointPort;
    }
}
