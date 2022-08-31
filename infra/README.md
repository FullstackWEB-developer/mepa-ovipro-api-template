## [Your project name]

OviPRO AWS infrastructure as code

-   🚨 100% written in TypeScript
-   🎯 Created with [AWS Cloud Development Kit](https://github.com/aws/aws-cdk)
-   ✅ Testing with Jest & CDK assert
-   ℹ️ CI/CD in [Github Actions](https://docs.github.com/en/actions)

[Description of your repository here]

<br/>

## Motivation

AWS CDK offers AWS-maintained high-level abstractions (called Constructs or Patterns) for AWS resources, which lead to better safety and developer experience. This also means **we** have a lot less code to maintain (for example compared to pure CloudFormation-based projects).

## Build status

TBD

## Code style

-   Eslint, Typescript and Prettier
-   If you are using vsc, it is highly recommended to use our shared settings `.vscode/settings.json`.
    By default VSC autoimports them, but if you have a manual setup consider copying them to your workspace settings.
-   Typescript Lambda conventions are inspired by the [Airbnb styleguide](https://github.com/airbnb/javascript).
-   Infra coding conventions are inspired by [various Alma project](https://github.com/almamedia/alma-cdk-jsii-accounts-and-environments) and AWS [best practice guides](https://aws.amazon.com/blogs/devops/best-practices-for-developing-cloud-applications-with-aws-cdk/).

## Infrastructure

![Current infrastructure](./diagram.png)

Generate new diagram by running

```typescript
cdk synth --c environment=staging --c account=dev
npx cdk-dia
```

## Tech/framework used

<b>Built with</b>

-   [Typescript](https://www.typescriptlang.org/)
-   [AWS CDK](https://github.com/aws/aws-cdk)
-   [Jest](https://jestjs.io/)
-   [NCC](https://github.com/vercel/ncc)
-   [Github Actions](https://github.com/features/actions)

We are also using [Ari Palo's](https://github.com/aripalo) useful custom CDK helper libraries:

-   [Tag and Name](https://github.com/almamedia/alma-cdk-jsii-tag-and-name)
-   [Regions](https://github.com/almamedia/alma-cdk-jsii-regions)
-   [Accounts and Environments](https://github.com/almamedia/alma-cdk-jsii-accounts-and-environments)
-   [OpenAPI](https://github.com/almamedia/alma-cdk-jsii-open-api)

## Installation

### CDK

Follow [AWS-docs](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html) for the latest guide. Includes installing CDK and generating AWS-profiles.

### Node & NPM

Check package.json for engine versions. Projects aim to support lts versions. Consider using n for version management.

-   run `n lts` to install latest LTS

### Docker

Docker is required for some activities like containerized test execution or containerized (Java) builds.

### Almamedia's private NPM packages

Some of the packages are in a different NPM registry (Github Packages), and developers needs to be authenticated before installing:

1. Create a new "personal access token" in Github
    1. Settings -> Developer Settings -> Personal Access Tokens
    2. Create a new token with `repo` and `read:packages` permissions
    3. Save your new access token somewhere (will be shown only once)
2. Run `npm login --scope @almamedia --registry https://npm.pkg.github.com`
    - NOTE: Password is your new access token!
3. Save your access token as an environment variable with key `GITHUB_ACCESS_TOKEN`

    - Ex. `export GITHUB_ACCESS_TOKEN="your_ghp_token_here"`

Now you should have access to Almamedia's private packages.

If any problems occur regarding permissions, ask for help.

### Java dependencies

The repository may contain optional Java code with dependencies. Add or update an existing ~/.m2/settings.xml file with at least the following server with your personal Github username and token required by the Maven Java build tool:

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/ 2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">
  <servers>
    <server>
      <id>mepa-ovipro</id>
      <username>GITHUB_USERNAME</username>
      <password>GITHUB_PERSONAL_ACCESS_TOKEN</password>
    </server>
  </servers>
</settings>
```

## Running

- build and install pre-requirements (some installations require npm i --legacy-peer-deps) `npm i && npm run build:all`

### CDK stacks

Automatic compilation

-   `npm run watch`

#### Manual deployments to feature-environments

Synthesize cdk stacks

-   `npx cdk synth --context account=dev --context environment=feature/EXAMPLEJIRA123 --profile ovipro-dev`

Compare deployed cdk stack to current state

-   `npx cdk diff --context account=dev --context environment=feature/EXAMPLEJIRA123 --profile ovipro-dev STACK_TO_DIFF`

Deploy stack to aws

-   `npx cdk deploy --context account=dev --context environment=feature/EXAMPLEJIRA123 --profile ovipro-dev STACK_TO_DEPLOY`

### CDK stacks

Automatic compilation

-   `npm run watch`

Temporary credentials / MFA

-   [Credential utility from the company AWS guru](https://github.com/aripalo/vegas-credentials)

## Development

1. Develop your new features or changes in a Jira-ticket named branch (eg. feature/JIRA-NNNN)
2. If you want, you can deploy feature-versions of your resources using a feature-type environment, named as `feature/JIRANNNN` (more info about environments in [Accounts & environments](https://github.com/almamedia/alma-cdk-jsii-accounts-and-environments)) **Note:** Dont use dashes (-) in branch name!. If you have dependencies on resources in other repositories, you need to deploy them to same environment (Jira-ticket named branch and environment).
3. When your changes in a PR are ready and reviewed, merge them to _main_-branch. Changes in main-branch are automatically deployed to staging-environment. **Never** deploy anything to staging-environment manually, it is not meant to be used as a development environment
4. Changes in _staging_-branch will be deployed to preprod-account nightly, if tests are showing green. **Never** deploy anything manually to preprod!
5. Manual deployments to production-account

### Lambdas

(For a new repo, note that the template repo doesn't include the API stack in the CDK main file environment.ts)

1. Develop your lambda, refer to `functions/sample`
2. Add the new lambda to package.json
3. Map this new Lambda to an OpenAPI spec endpoint updating the spec as needed, see infra/api/index.ts

```typescript
new VersionedOpenApi(this, 'SampleApiV1', {
    openApiDefinitionFileName: 'realty-api-v1-bundle.yaml',
    apigatewayIntegrations: {
        '/plotProperties': {
            get: { fn: sample.getFunction },
            post: { fn: sample.getFunction },
        },
        ...
    },
    ...
});
```

4. Deploy the stack

Make sure to include:

-   Good quality documentation.
-   Handler unit tests for different use cases to make refactoring more secure.
-   Data access layer tests, narrow integration tests to catch regressions when libraries are updated.

## Tests

### Unit tests

All CDK stacks should be tested with snapshot tests. These safeguard against unwanted changes like AWS CDK version regressions.

-   Keep unit tests in the same folder as their source file.
-   Keep snapshots always updated, and remember to commit their changes

```typescript
npm test:update
```

Lambda development is test-driven. Lambda unit tests reside in separate \_\_tests\_\_ folders next to implementations. There are two types of Lambda unit tests:

1. Handler tests with _testLambdaHandler_ enable testing with static inputs, outputs and mock data or constructs.

```typescript
npm test
```

2. Data access layer tests may rely on Docker containers, which slow down test runs, so they are run and enabled separately. These are known as narrow integration tests:

```typescript
npm integration-test
```

## Important

--

**NEVER** make changes to CDK-deployed resources in web console (or anywhere else than CDK). The manually modified resources might become out-of-sync with CDK, and you can not deploy changes to your stacks anymore.
If you make this mistake, you need to manually delete the stacks before deploying them again.

--

Feel like Jest tests are passing while they shouldn't? Run `npm run clean` and build again. Sometimes Typescript compiling gets stuck (especially when renaming stuff)
