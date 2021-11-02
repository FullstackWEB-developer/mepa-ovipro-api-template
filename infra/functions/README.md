# Lambda development

This folder contains Lambda implementations. A way to organize Lambda functions:

| Folder name | Description                                                                      |
| ----------- | -------------------------------------------------------------------------------- |
| api         | API Lambda implementations.                                                      |
| utils       | Shared code between API and other Lambda implementations.                        |
| sample      | Template reference implementations for lambdas.                                  |
| others      | Miscellaneous lambdas. The subfolders should reflect the Lambda location in CDK. |

## API Lambda folder structure

API lambdas should be located under ./api.

| Folder name | Description                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| handlers    | The _handlers_ folder structure should reflect the API endpoint paths. The handler name should reflect the endpoint method type name. |
| dao         | Data access layer code.                                                                                                               |
| dto         | Lambda response or intermediate Typescript types and classes.                                                                         |
| model       | Database or repository layer entity types.                                                                                            |
| utils       | Misc utilities.                                                                                                                       |
