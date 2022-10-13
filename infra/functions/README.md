# Lambda development

This folder contains Lambda implementations. Alternative ways to organize Lambda functions:

**Single layer organization for simple backends**

| Folder name | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| api         | API Lambda implentations                                                         |
| utils       | Shared code between API and other Lambda implementations.                        |
| sample      | Template reference implementations for lambdas.                                  |
| others      | Miscellaneous lambdas. The subfolders should reflect the Lambda location in CDK. |

**Multi-layer organization**

| Folder name  | Description                                                                      |
| ------------ | -------------------------------------------------------------------------------- |
| _domainXtoY_ | Lambdas for domains X to Y.                                                      |
| utils        | Shared code between API and other Lambda implementations.                        |
| sample       | Template reference implementations for lambdas.                                  |
| others       | Miscellaneous lambdas. The subfolders should reflect the Lambda location in CDK. |

Each domain is further organized by the single layer convention.

## API Lambda folder structure

How to structure a _domain_:

| Folder name | Description                                                                                                                           |
| ----------- |---------------------------------------------------------------------------------------------------------------------------------------|
| handlers    | The _handlers_ folder structure should reflect the API endpoint paths. The handler name should reflect the endpoint method type name. |
| dao         | Data access layer code.                                                                                                               |
| dto         | Lambda response or intermediate Typescript types and classes.                                                                         |
| model       | Database or repository layer entity types.                                                                                            |
| utils       | Misc utilities.                                                                                                                       |
