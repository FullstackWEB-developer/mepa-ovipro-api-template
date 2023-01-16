import { EC, Name } from '@alma-cdk/project';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';

/**
 * Create domain name for api
 * Eg. api-preview-123.example.net
 */
export const createApiDomainName = (scope: Construct, hostedZoneName: string): string => {
    const environmentWwwSuffix =
        EC.isStable(scope) || EC.isVerification(scope) ? '' : `-${EC.getName(scope).replace('/', '-')}`;
    return `api${environmentWwwSuffix}.${hostedZoneName}`.toLowerCase();
};

/**
 * Create domain name for frontend application
 * Eg. app-preview-123.example.net
 */
export const createFrontEndDomainName = (scope: Construct, hostedZoneName: string): string => {
    const environmentWwwSuffix =
        EC.isStable(scope) || EC.isVerification(scope) ? '' : `-${EC.getName(scope).replace('/', '-')}`;
    return `app${environmentWwwSuffix}.${hostedZoneName}`.toLowerCase();
};

/**
 * Create a wildcard domain for given hosted zone
 */
export const createWildcardDomainName = (hostedZoneName: string): string => {
    return `*.${hostedZoneName}`.toLowerCase();
};

/**
 * Create queue name for sqs fifo queue
 */
export const createFifoSqsQueueName = (scope: Construct, baseName: string, isDlq?: boolean): string => {
    const nameWithProject = Name.withProject(scope, baseName);
    // SQS queue name maxLength is 80 so cut name if too long.
    return `${nameWithProject.substr(0, 70)}${isDlq ? 'DLQ' : ''}.fifo`;
};

/**
 * Get (search) index name + space.
 * @param parent Construct to use as a CDK property/tag reference. Often _this_.
 * @returns Index name and namespace.
 */
export const getRealtyIndexName = (
    parent: Construct,
): {
    namespace: string;
    name: string;
} => {
    const environmentName = pascalCase(EC.getName(parent));

    const namespace = `${environmentName}_realty.`.toLowerCase();
    const name = `${namespace}realty_v1_current`;
    return {
        namespace,
        name,
    };
};
