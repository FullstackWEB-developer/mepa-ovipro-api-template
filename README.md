![Staging workflow](https://github.com/almamedia/mepa-ovipro-api-template/actions/workflows/main-pipeline.yml/badge.svg)
[![GitHub Super-Linter](https://github.com/almamedia/mepa-ovipro-api-template/workflows/Main%20pipeline/badge.svg)](https://github.com/marketplace/actions/super-linter)

# mepa-ovipro-template

Description

**Add here description of API domain**
example:
_Realty API provides infrastructure, data and implementation for all Realty API's microservices._

---

<br/>

## List of OviPRO AWS repositories

| Name                                                                                       | Description                                  |
| ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| **OviPRO template repository**                                                             | Template for quick starting a new repository |
| [Account infrastructure](https://github.com/almamedia/mepa-ovipro-common-account)          | Account specific resources                   |
| [Environment infrastructure ](https://github.com/almamedia/mepa-ovipro-common-environment) | Environment specific resources               |
| [OviPRO core backend](https://github.com/almamedia/mepa-ovipro-core-backend)               | Core backend                                 |
| [Assignment API](https://github.com/almamedia/mepa-ovipro-assignment-backend)              | Assignment API                               |
| [Statistics API](https://github.com/almamedia/mepa-ovipro-statistics-backend)              | Statistics API                               |
| [Housing company API](https://github.com/almamedia/mepa-ovipro-housing-company-backend)    | Housing company API                          |
| [Realty API](https://github.com/almamedia/mepa-ovipro-realty-backend)                      | Realty & marketing API                       |
| [Party API](https://github.com/almamedia/mepa-ovipro-party-backend)                        | Party API                                    |
| [Data-import tools](https://github.com/almamedia/mepa-ovipro-data-import-backend)          | Data import & migration tools                |

<br/><br/>

| [Infrastructure](#aws-infrastructure) | [Otsikko1](#running) | [Otsikko2](#tests) | [Important notes](#important) |
| :-----------------------------------: | :------------------: | :----------------: | :---------------------------: |

---

<br/><br/>

## Repository structure overview

Main folders and their descriptions:

| Name            | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| api-specs       | OpenAPI schemas for code generation, source of truth for development |
| api-docs        | Generated HTML documentation from OpenAPI schemas                    |
| api-tests       | Integration tests for the API endpoints and infrastructure           |
| design          | Misc technical design, e.g. data modeling                            |
| infra           | AWS project root                                                     |
| infra/lib       | AWS infrastructure                                                   |
| infra/functions | AWS lambdas                                                          |
| db              | Database migration handling and DB schemas. Optional                 |
| src             | Source code for Java offshoot projects. Optional                     |
| api/\*\*        | API design phase bleeding edge specs and docs. Optional              |

## AWS infrastructure

![Current infrastructure](./infra/docs/infra.drawio.png)

<br/><br/>
