import { AC } from '@almamedia-open-source/cdk-project-target';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AlmaCidrType } from './types';

/**
 * For "legacy" reasons account types are
 * dev => qa1
 * preprod => qa2
 * prod => prod
 *
 * This function just maps them correctly...
 */
const getAccountType = (scope: Construct) => {
    const accountType = AC.getAccountType(scope);

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

const createParameterName = (scope: Construct, resourceType: AlmaCidrType) =>
    `cidr-${AC.getAccountConfig(scope, 'service')}-${getAccountType(scope)}-${resourceType}`;

/**
 * Custom helper construct for importing Alma CIDR-values
 */
export class AlmaCidr extends Construct {
    constructor(scope: Construct, id: string) {
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
