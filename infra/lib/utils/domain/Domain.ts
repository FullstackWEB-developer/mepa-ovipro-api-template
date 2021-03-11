import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import { Ac, Ec } from '@almamedia/cdk-accounts-and-environments';

export class Domain extends cdk.Construct {
    public readonly zone: route53.IHostedZone;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const zone = route53.PublicHostedZone.fromLookup(this, 'Zone', {
            domainName: `${Ec.getName(this)}.${Ac.getConfig(this, 'domain')}`,
        });

        this.zone = zone;
    }
}
