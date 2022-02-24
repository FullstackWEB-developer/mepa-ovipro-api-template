import * as cdk from '@aws-cdk/core';
import { Ec } from '@almamedia/cdk-accounts-and-environments';

/**
 * Create domain name for api
 * Eg. api-preview-123.example.net
 */
export const createApiDomainName = (scope: cdk.Construct, hostedZoneName: string): string => {
    const environmentSuffix = Ec.isStable(scope) ? '' : `-${Ec.getName(scope).replace('/', '-')}`;
    return `api${environmentSuffix}.${hostedZoneName}`.toLowerCase();
};

/**
 * Create domain name for frontend application
 * Eg. app-preview-123.example.net
 */
export const createFrontEndDomainName = (scope: cdk.Construct, hostedZoneName: string): string => {
    const environmentSuffix = Ec.isStable(scope) ? '' : `-${Ec.getName(scope).replace('/', '-')}`;
    return `app${environmentSuffix}.${hostedZoneName}`.toLowerCase();
};

/**
 * Create a wildcard domain for given hosted zone
 */
export const createWildcardDomainName = (hostedZoneName: string): string => {
    return `*.${hostedZoneName}`.toLowerCase();
};
