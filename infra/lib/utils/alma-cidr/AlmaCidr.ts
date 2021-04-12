import * as cdk from '@aws-cdk/core';
import { Ac } from '@almamedia/cdk-accounts-and-environments';
import { AlmaCidrType } from './types';

/**
 * For "legacy" reasons account types are
 * dev => qa1
 * preprod => qa2
 * prod => prod
 *
 * This function just maps them correctly...
 */
const getAccountType = (scope: cdk.Construct) => {
    const accountType = Ac.getType(scope);

    switch (accountType) {
        case 'dev':
            return 'qa1';
        case 'preprod':
            return 'qa2';
        case 'prod':
            return 'prod';
        default:
            throw new Error('Unknown account type');
    }
};

const createParameterName = (scope: cdk.Construct, resourceType: AlmaCidrType) =>
    `cidr-${Ac.getConfig(scope, 'service')}-${getAccountType(scope)}-${resourceType}`;

/**
 * Custom helper construct for importing Alma CIDR-values
 */
export class AlmaCidr extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
    }

    /**
     * Import cidr value
     *
     * @param resource
     */
    import(resource: AlmaCidrType): string {
        const value = cdk.Fn.importValue(createParameterName(this, resource));

        return value;
    }
}
