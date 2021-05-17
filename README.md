![Staging workflow](https://github.com/almamedia/mepa-ovipro-api-template/actions/workflows/main-pipeline.yml/badge.svg)
[![GitHub Super-Linter](https://github.com/almamedia/mepa-ovipro-api-template/workflows/Main%20pipeline/badge.svg)](https://github.com/marketplace/actions/super-linter)


## mepa-ovipro-template

Description

**Add here description of API domain**
example:
_Realty API provides infrastructure, data and implementation for all Realty API's microservices._
---

<br/>

### List of OviPRO AWS repositories

| Name                                                                    | Description                                    |
| ----------------------------------------------------------------------- | ---------------------------------------------- |
| **OviPRO template repository**   | Template for quick starting a new repository                            |
| [OviPRO account wide infrastructure](https://github.com/almamedia/mepa-ovipro-common)| Shared account wide resources for OviPRO AWS infrastructure |
| [OviPRO shared infrastructure (environment)](https://github.com/almamedia/mepa-ovipro-common-environment)| Shared environment specific resources for OviPRO AWS infrastructure |
| [OviPRO shared infrastructure (account)](https://github.com/almamedia/mepa-ovipro-common-account)| Shared account specific resources for OviPRO AWS infrastructure |
| [OviPRO core backend](https://github.com/almamedia/mepa-ovipro-core-backend)       | Core backend                          |

<br/><br/>

| [Infrastructure](#aws-infrastructure) | [Otsikko1](#running) | [Otsikko2](#tests) | [Important notes](#important) |
| :-------------------------------: | :-----------------: | :-------------: | :---------------------------: |

---

<br/><br/>

## AWS infrastructure

![Current infrastructure](./infra/docs/infra.drawio.png)

<br/><br/>

## Authorize requests
All requests has to be authorized. Authentication is provided by Alma Yritystunnus or AWS Cognito. Both generates JWT that are validated by Authentication Lambda. This lambda will return _OrganisationPermissinTree_ object, that will contain information such _is user allowed to perform action in orgranisation Y_.
This auhtorization will be done using _has-permission_ functions such as `checkForPermission`. Here is a sample for checking if current user is either **PRO_VIEWER** or **PRO_SELF_VIEWER** and has **PRO_PROPERTY**:
```typescript
import { hasPermission } from '../../../auth/has-permission/index';
import { OrganizationUnitLevel, PermissionType } from '../../../auth/has-permission/userdetails';

export async function processRequest(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const isAuthorized: boolean = hasPermission(
            { level: OrganizationUnitLevel.CUSTOMER, organizationId: event.queryStringParameters?.organisatonId, permission: PermissionType.PRO_PROPERTY },
            event.requestContext.authorizer?.userDetails,
        );
        if (!isAuthorized) {
            throw createHttpError(401, 'No permission');
        }
        const isProViewer = hasPermission(
            { level: OrganizationUnitLevel.CUSTOMER, organizationId: event.queryStringParameters?.organisatonId, permission: PermissionType.PRO_VIEWER },
            event.requestContext.authorizer?.userDetails,
        );
        const isProSelfViewer = hasPermission(
            {
                level: OrganizationUnitLevel.CUSTOMER,
                organizationId: event.queryStringParameters?.organisatonId,
                permission: PermissionType.PRO_SELF_VIEWER,
            },
            event.requestContext.authorizer?.userDetails,
        );
        if (!isProViewer || !isProSelfViewer) {
            throw createHttpError(401, 'No permission');
        }
```

## Quality and Assurance
Q&A gate should be checked on every push. We use Sonarqube (sonarcloud) for this. In order to check it, project key has to be created into Sonarcloud (requested from `Antti Koivisto`). All relavent information is to be updated to `sonar-project.properties` file.
