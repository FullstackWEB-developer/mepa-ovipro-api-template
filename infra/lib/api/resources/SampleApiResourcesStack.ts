import { ProjectStack, ProjectStackProps } from '@almamedia-open-source/cdk-project-stack';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { DefaultVpc } from '../../default-resources/shared/vpc';

export class SampleApiResourcesStack extends ProjectStack {
    public readonly apiEndpointLambdaSecurityGroup: ec2.ISecurityGroup;

    /** Creates an ECS Cluster inside given VPC */
    constructor(scope: Construct, id: string, props: ProjectStackProps) {
        super(scope, id, props);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');

        const apiEndpointLambdaSecurityGroup = new ec2.SecurityGroup(this, 'SampleApiEndpointLambdaSg', {
            vpc,
            description: 'Shared securitygroup for sample api lambdas. We need this to limit ENI usage',
        });

        this.apiEndpointLambdaSecurityGroup = apiEndpointLambdaSecurityGroup;
    }
}
