import * as openapix from '@alma-cdk/openapix';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { VersionedOpenApi } from '../../../constructs/VersionedOpenApi';
import { OviproEnvironmentSharedResource } from '../../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../../utils/shared-resources/types';

interface TemplateApiGwStackProps {
    template: {
        getFunction: lambda.IFunction;
    };
}

export class TemplateApi extends Construct {
    constructor(scope: Construct, id: string, props: TemplateApiGwStackProps) {
        super(scope, id);

        const { template } = props;

        const sharedEnvResource = new OviproEnvironmentSharedResource(this, 'TemplateApiEnvSharedResource');

        const { api } = new VersionedOpenApi(this, 'TemplateApiV1', {
            openApiDefinitionFileName: 'template-api-v1-bundle.yaml',
            paths: {
                '/template': {
                    get: new openapix.LambdaIntegration(this, template.getFunction),
                },
            },
            apiName: 'template',
            version: 1,
        });

        /**
         * TEMPORARILY EXPORT API EXECUTE ENDPOINT TO BE USED IN FRONTEND
         * TODO: remove this when wildcard custom domain is supported
         */
        const apiExecuteEndpointWithoutProtocol = cdk.Fn.select(
            1,
            cdk.Fn.split('://', api.deploymentStage.urlForPath()),
        );
        const apiExecuteEndpoint = cdk.Fn.select(0, cdk.Fn.split('/', apiExecuteEndpointWithoutProtocol));
        sharedEnvResource.export(SharedResourceType.TEMPLATE_API_ENDPOINT_EXECUTE_URL, apiExecuteEndpoint);
    }
}
