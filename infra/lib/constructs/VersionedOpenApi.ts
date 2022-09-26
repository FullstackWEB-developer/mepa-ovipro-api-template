import path from 'path';
import * as openapix from '@alma-cdk/openapix';
import { AC, EC, Name } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { createApiDomainName, createFrontEndDomainName } from '../utils/naming';
import { OviproAccountSharedResource } from '../utils/shared-resources/OviproAccountSharedResource';
import { OviproEnvironmentSharedResource } from '../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../utils/shared-resources/types';

interface Props {
    /**
     * Normally apigateway integrations are defined in OpenAPI-specs,
     * but in our case we don't want to do that.
     * Apigateway integrations must be manually defined in this property,
     * and they must match the path and method definitions in the imported
     * OpenApi-spec file.
     *
     * Example:
     * ```
        '/plotProperties/{realtyId}': {
            'get': new openapix.LambdaIntegration(this, getFn),
            'post': new openapix.LambdaIntegration(this, postFn),
            'oyt': new openapix.LambdaIntegration(this, putFn),
        },
     * ```
     */
    paths: openapix.Paths;
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

export class VersionedOpenApi extends Construct {
    public readonly api: apigw.SpecRestApi;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const { paths, version, apiName, openApiDefinitionFileName } = props;

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
        const frontendDomainName = createFrontEndDomainName(this, topLevelHzZoneName);
        // AC.isDev(this) && EC.isStable(this)
        //     ? createWildcardDomainName(this, topLevelHzZoneName)
        // : createFrontEndDomainName(this, topLevelHzZoneName);

        const authorizerLambda = lambda.Function.fromFunctionAttributes(this, 'AuthorizerLambda', {
            functionArn: sharedEnvResource.import(SharedResourceType.LAMBDA_AUTHORIZER_ARN),
            /**
             * Cant modify permissions on imported lambdas without this flag
             */
            sameEnvironment: true,
        });

        const authorizerName = 'bearerAuth';

        const authorizer = new openapix.LambdaAuthorizer(this, authorizerName, {
            fn: authorizerLambda,
            identitySource: apigw.IdentitySource.header('Authorization'),
            resultsCacheTtl: cdk.Duration.seconds(300),
            type: 'request',
            authType: 'custom',
        });

        // Shorthand flag for API logging.
        const enableLogging = AC.isDev(this) || EC.isMock(this);

        const openApiX = new openapix.Api(this, `${restApiName}OpenApiX`, {
            source: path.join(__dirname, `../../../api-specs/${openApiDefinitionFileName}`),
            paths,
            injections: {
                'components.securitySchemes.bearerAuth.type': 'apiKey',
                'components.securitySchemes.bearerAuth.in': 'header',
                'components.securitySchemes.bearerAuth.name': 'Authorization',
                'x-amazon-apigateway-request-validator': 'all',
                'x-amazon-apigateway-request-validators': {
                    all: {
                        validateRequestBody: true,
                        validateRequestParameters: true,
                    },
                },
            },
            rejectionsDeep: ['example'],
            restApiProps: {
                restApiName,
                deployOptions: {
                    stageName,
                    tracingEnabled: true,
                    loggingLevel: enableLogging ? apigw.MethodLoggingLevel.INFO : undefined,
                    accessLogDestination: enableLogging ? new apigw.LogGroupLogDestination(logGroup) : undefined,
                    // WARN: do not enable data tracing for sensitive environments.
                },
                // disableExecuteApiEndpoint: true,
            },
            authorizers: [authorizer],
        });

        const api = openApiX;

        /**
         * Add custom gateway response to bad request body
         */
        api.addGatewayResponse('BadRequestBody', {
            type: apigw.ResponseType.BAD_REQUEST_BODY,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                    description: '$context.error.validationErrorString',
                }),
            },
        });

        api.addGatewayResponse('BadRequestParameters', {
            type: apigw.ResponseType.BAD_REQUEST_PARAMETERS,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                    details: [
                        {
                            target: '$context.error.validationErrorString',
                            errorCode: '$context.error.responseType',
                            message: '$context.error.message',
                        },
                    ],
                }),
            },
        });

        api.addGatewayResponse('InvalidApiKey', {
            type: apigw.ResponseType.INVALID_API_KEY,
            statusCode: '403', // TODO is this valid?
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('InvalidSignature', {
            type: apigw.ResponseType.INVALID_SIGNATURE,
            statusCode: '403',
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('ExpiredToken', {
            type: apigw.ResponseType.EXPIRED_TOKEN,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('MissingAuthenticationToken', {
            type: apigw.ResponseType.MISSING_AUTHENTICATION_TOKEN,
            statusCode: '403',
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('ResourceNotFound', {
            type: apigw.ResponseType.RESOURCE_NOT_FOUND,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('AccessDenied', {
            type: apigw.ResponseType.ACCESS_DENIED,
            statusCode: '403',
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('Throttled', {
            type: apigw.ResponseType.THROTTLED,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('Unauthorized', {
            type: apigw.ResponseType.UNAUTHORIZED,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('Default4XX', {
            type: apigw.ResponseType.DEFAULT_4XX,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        api.addGatewayResponse('Default5XX', {
            type: apigw.ResponseType.DEFAULT_5XX,
            templates: {
                'application/json': JSON.stringify({
                    errorCode: '$context.error.responseType',
                    message: '$context.error.message',
                }),
            },
        });

        /**
         * Support for this flag has been recently added in cloudformation
         */
        // (api.api.node.children[0] as apigw.CfnRestApi).addPropertyOverride('DisableExecuteApiEndpoint', 'true');

        /**
         * Map domain path dev/example/get -> foo/v1/example/get
         */
        new apigwv2.CfnApiMapping(this, `${restApiName}${version}ApiApigwMapping`, {
            apiMappingKey: `${apiName}/v${version}`,
            apiId: api.restApiId,
            stage: api.deploymentStage.stageName,
            domainName: apiDomainName,
        });

        const frontendMapping = new apigwv2.CfnApiMapping(this, `${restApiName}${version}FrontendApigwMapping`, {
            apiMappingKey: `${apiName}/v${version}`,
            apiId: api.restApiId,
            stage: api.deploymentStage.stageName,
            domainName: frontendDomainName,
        });

        /**
         * Fixes stuck cloudformation update events
         */
        frontendMapping.node.addDependency(api);

        this.api = api;
    }
}
