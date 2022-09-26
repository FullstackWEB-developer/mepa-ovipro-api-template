import * as openapix from '@alma-cdk/openapix';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { VersionedOpenApi } from '../../../constructs/VersionedOpenApi';
import { OviproEnvironmentSharedResource } from '../../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../../utils/shared-resources/types';

interface SampleApiGwStackProps {
    sample: {
        getFunction: lambda.IFunction;
    };
}

export class SampleApi extends Construct {
    constructor(scope: Construct, id: string, props: SampleApiGwStackProps) {
        super(scope, id);

        const { sample } = props;

        const sharedEnvResource = new OviproEnvironmentSharedResource(this, 'SampleApiEnvSharedResource');

        const { api } = new VersionedOpenApi(this, 'MarketingApiV1', {
            openApiDefinitionFileName: 'marketing-api-v1-bundle.yaml',
            paths: {
                '/sample': {
                    get: new openapix.LambdaIntegration(this, sample.getFunction),
                },
            },
            apiName: 'sample',
            version: 1,
        });

        /**
         * TEMPORARILY EXPORT API EXECUTE ENDPOINT TO BE USED IN FRONTEND
         * TODO: remove this when wildcard custom domain is supported
         */
        // const apiExecuteEndpointWithoutProtocol = cdk.Fn.select(
        //     1,
        //     cdk.Fn.split('://', api.deploymentStage.urlForPath()),
        // );
        // const apiExecuteEndpoint = cdk.Fn.select(0, cdk.Fn.split('/', apiExecuteEndpointWithoutProtocol));
        // sharedEnvResource.export(SharedResourceType.SAMPLE_API_ENDPOINT_EXECUTE_URL, apiExecuteEndpoint);
    }
}
