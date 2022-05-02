import { EC } from '@almamedia-open-source/cdk-project-target';
import { Construct } from 'constructs';

/**
 * Create domain name for api
 * Eg. api-preview-123.example.net
 */
export const createApiDomainName = (scope: Construct, hostedZoneName: string): string => {
    const environmentSuffix = EC.isStable(scope) ? '' : `-${EC.getName(scope).replace('/', '-')}`;
    return `api${environmentSuffix}.${hostedZoneName}`.toLowerCase();
};

/**
 * Create domain name for frontend application
 * Eg. app-preview-123.example.net
 */
export const createFrontEndDomainName = (scope: Construct, hostedZoneName: string): string => {
    const environmentSuffix = EC.isStable(scope) ? '' : `-${EC.getName(scope).replace('/', '-')}`;
    return `app${environmentSuffix}.${hostedZoneName}`.toLowerCase();
};

/**
 * Create a wildcard domain for given hosted zone
 */
export const createWildcardDomainName = (hostedZoneName: string): string => {
    return `*.${hostedZoneName}`.toLowerCase();
};
