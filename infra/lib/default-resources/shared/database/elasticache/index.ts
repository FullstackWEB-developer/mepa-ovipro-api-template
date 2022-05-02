import { ProjectStack, ProjectStackProps } from '@almamedia-open-source/cdk-project-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { OviproEnvironmentSharedResource } from '../../../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../../../utils/shared-resources/types';

interface Props extends ProjectStackProps {
    vpc: ec2.Vpc;
}

export class DefaultElasticCache extends ProjectStack {
    public readonly endpointAddress: string;
    public readonly endpointPort: string;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        /**
         * Import shared cluster's address and port
         *
         * Importing cache cluster as a CDK-resource is not possible, unless either
         * we or aws creates a class where lookup-function is implemented
         */
        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');
        const endpointAddress = sharedResource.import(SharedResourceType.CACHE_CLUSTER_ENDPOINT_ADDRESS);
        const endpointPort = sharedResource.import(SharedResourceType.CACHE_CLUSTER_ENDPOINT_PORT);

        this.endpointAddress = endpointAddress;
        this.endpointPort = endpointPort;
    }
}
