import * as cdk from '@aws-cdk/core';
import { Ec } from '@almamedia/cdk-accounts-and-environments';

export const createApiDomainName = (scope: cdk.Construct, hostedZoneName: string): string => {
    const environmentWwwSuffix = Ec.isStable(scope) ? '' : `-${Ec.getName(scope).replace('/', '-')}`;
    return `api${environmentWwwSuffix}.${hostedZoneName}`.toLowerCase();
};

export const createFrontEndDomainName = (scope: cdk.Construct, hostedZoneName: string): string => {
    const environmentWwwSuffix = Ec.isStable(scope) ? '' : `-${Ec.getName(scope).replace('/', '-')}`;
    return `www${environmentWwwSuffix}.${hostedZoneName}`.toLowerCase();
};
