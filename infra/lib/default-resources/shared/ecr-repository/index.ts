import * as cdk from '@aws-cdk/core';
import * as ecr from '@aws-cdk/aws-ecr';
import { OviproSharedResource } from '../../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../../utils/shared-resources/types';

export class DefaultEcrRepository extends cdk.Construct {
    public readonly repository: ecr.IRepository;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        /**
         * Import shared repository's name
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const repositoryName = sharedResource.import(SharedResourceType.ECR_REPOSITORY_NAME);

        const repository = ecr.Repository.fromRepositoryName(this, 'DefaultEcr', repositoryName);

        this.repository = repository;
    }
}
