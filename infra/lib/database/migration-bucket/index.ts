import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { Name } from '@almamedia/cdk-tag-and-name';
import { Ac, Ec } from '@almamedia/cdk-accounts-and-environments';
import { pascalCase } from 'change-case';
import { RemovalPolicy } from '@aws-cdk/core';

export class MigrationBucketStack extends cdk.Stack {
    public readonly s3Bucket: s3.Bucket;

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const name = `ovipro${Ac.getType(this)}${pascalCase(Ec.getName(this))}migrations`;

        const s3Bucket = new s3.Bucket(this, Name.withProject(this, name), {
            bucketName: name.toLowerCase(),
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            encryption: s3.BucketEncryption.S3_MANAGED,
            autoDeleteObjects: !Ec.isStable(this),
            removalPolicy: Ec.isStable(this) ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        });

        this.s3Bucket = s3Bucket;
    }
}
