import * as ec2 from 'aws-cdk-lib/aws-ec2';

export type EndpointStacksConstructProps = {
    apiEndpointLambdaSecurityGroup: ec2.ISecurityGroup;
};
