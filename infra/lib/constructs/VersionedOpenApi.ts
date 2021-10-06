import path from 'path';
import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as logs from '@aws-cdk/aws-logs';
import { OpenApi, IApigatewayIntegrations } from '@almamedia/cdk-open-api';
import { createApiDomainName, createFrontEndDomainName, createWildcardDomainName } from '../utils/naming';
import { OviproAccountSharedResource } from '../utils/shared-resources/OviproAccountSharedResource';
import { SharedResourceType } from '../utils/shared-resources/types';
import { Name } from '@almamedia/cdk-tag-and-name';
import { Ac, Ec } from '@almamedia/cdk-accounts-and-environments';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';

interface Props extends cdk.StackProps {
    /**
     * Normally apigateway integrations are defined in OpenAPI-specs,
     * but in our case we don't want to do that.
     * Apigateway integrations must be manually defined in this property,
     * and they must match the path and method definitions in the imported
     * OpenApi-spec file.
     *
     * NOTE: Make sure functionParameter-string are the same as in functionParameters-property.
     *
     * Example:
     * ```
        '/plotProperties/{realtyId}': {
            get: {
                functionParameter: 'PlotPropertiesRealtyIdGet',
                },
            post: {
                functionParameter: 'PlotPropertiesRealtyIdGet',
            },
            put: {
                functionParameter: 'PlotPropertiesRealtyIdGet',
            },
        },
     * ```
     */
    apigatewayIntegrations: IApigatewayIntegrations;
    /**
     * In our current repository structure definition-files live in "api-specs"-folder,
     * which is not the best solution infra-wise.
     * You need to give the file name here, ex.:
     * ```
     * 'realty-api-v1.yaml'
     * ```
     *
     * We are then using "node-path"-library to retrieve the given file below root (infra-folder):
     * ```path.join(__dirname, `../../../../api-specs/${openApiDefinitionFileName}`),``
     */
    openApiDefinitionFileName: string;
    /**
     * Version number
     *
     * We are not using versioned apigateway or lambdas, and each version will have their own
     * OpenApi spec file. We are using a custom versioning solution
     */
    version: number;
    /**
     * API-name, ex. `realty`
     */
    apiName: string;
}

export class VersionedOpenApi extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id);

        const { apigatewayIntegrations, version, apiName, openApiDefinitionFileName } = props;

        const stageName = `v${version}`;
        const restApiName = Name.withProject(
            this,
            `${apiName[0].toUpperCase() + apiName.substr(1).toLowerCase()}ApiV${version}`,
        );
        const sharedResource = new OviproAccountSharedResource(this, 'SharedResource');
        const sharedEnvResource = new OviproEnvironmentSharedResource(this, 'EnvSharedResource');
        const topLevelHzZoneName = sharedResource.import(SharedResourceType.TOP_LEVEL_HOSTED_ZONE_NAME);
        const apiDomainName = createApiDomainName(this, topLevelHzZoneName);

        const logGroupArn = sharedEnvResource.import(SharedResourceType.ENVIRONMENT_LOGGROUP_ARN);
        const logGroup = logs.LogGroup.fromLogGroupArn(
            this,
            'EnvironmentLogGroup',
            logGroupArn.includes('dummy-value-for-') ? 'arn:aws:logs:us-east-1:123456789012:loggroup' : logGroupArn,
        );
        /**
         * We use wildcard in dev account's staging environment
         */
        const frontendDomainName =
            Ac.isDev(this) && Ec.isStable(this)
                ? createWildcardDomainName(this, topLevelHzZoneName)
                : createFrontEndDomainName(this, topLevelHzZoneName);

        const authorizer = lambda.Function.fromFunctionAttributes(this, 'AuthorizerLambda', {
            functionArn: sharedEnvResource.import(SharedResourceType.LAMBDA_AUTHORIZER_ARN),
            /**
             * Cant modify permissions on imported lambdas without this flag
             */
            sameEnvironment: true,
        });

        // Shorthand flag for API logging. Disabled by default.
        const enableLogging = false;

        const api = new OpenApi(this, `${restApiName}OpenApi`, {
            openApiDefinitionPath: path.join(__dirname, `../../../api-specs/${openApiDefinitionFileName}`),
            restApiProps: {
                restApiName,
                deployOptions: {
                    stageName,
                    tracingEnabled: true,
                    loggingLevel: enableLogging ? apigw.MethodLoggingLevel.INFO : undefined,
                    accessLogDestination: enableLogging ? new apigw.LogGroupLogDestination(logGroup) : undefined,
                    // WARN: do not enable data tracing for sensitive environments.
                },
            },
            gatewayResponses: true,
            gatewayResponseConfig: {
                hide403: true,
            },
            apigatewayIntegrations,
            generateApigatewayRequestValidator: true,
            generateApigatewayRequestValidators: true,
            customAuthorizer: authorizer,
        });

        /**
         * Add custom gateway response to bad request body
         */
        api.api.addGatewayResponse('BadRequestBody', {
            type: apigw.ResponseType.BAD_REQUEST_BODY,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                    description: '$context.error.validationErrorString',
                }),
            },
        });

        /**
         * Support for this flag has been recently added in cloudformation
         */
        (api.api.node.children[0] as apigw.CfnRestApi).addPropertyOverride('DisableExecuteApiEndpoint', 'true');

        /**
         * Map domain path dev/example/get -> foo/v1/example/get
         */
        new apigwv2.CfnApiMapping(this, `${restApiName}${version}ApiApigwMapping`, {
            apiMappingKey: `${apiName}/v${version}`,
            apiId: api.api.restApiId,
            stage: api.api.deploymentStage.stageName,
            domainName: apiDomainName,
        });

        const frontendMapping = new apigwv2.CfnApiMapping(this, `${restApiName}${version}FrontendApigwMapping`, {
            apiMappingKey: `${apiName}/v${version}`,
            apiId: api.api.restApiId,
            stage: api.api.deploymentStage.stageName,
            domainName: frontendDomainName,
        });

        /**
         * Fixes stuck cloudformation update events
         */
        frontendMapping.node.addDependency(api);
    }
}
