# Lambda authorization

Every API Lambda should check for authorization. Every API request contains a user token that contains a complete user permission tree. Types of authorization checks may include but are not limited to: user role or state based authorization, entity query result authorization checks, query-baked authorization, input validation.

We can define multiple action types that may be authorized. These are linked to specific user permissions. Actions include but are not limited to: _view_, _edit_,

## User role or state based authorization

Every API endpoint should check that a user token is included in the request. Some endpoints may allow only e.g. administrator access. Permission utilities reside under [has-permission](./has-permission).

## Entity query result authorization

Every endpoint needs to authorize the data that is returned. For example to call a get endpoint on a Realty entity, the Lambda needs to authorize a view action on the entity. To update a Realty entity, the Lambda needs to authorize an edit action. A systematic way of implementing this authorization is presented in the case study https://mediapartners.atlassian.net/wiki/spaces/OVIPROAPI/pages/3115679753/How+to+implement+API+endpoint+authorizers+-+case+Realty.

## Query authorization

When other avenues are non-performant or complex, authorization may be built into the database queries so that only authorized data is returned from the database. In the case of the relational database queries there's a view user_permissions_v. This should be used to simplify queries with authorization baked in.

## Input validation

In some cases the user can update and create entity links between a given entity and another user, for example in the Realty schema we have an entity _Agent_ that is a link table between a user and a Realty. In this case we need to validate that only authorized users are given as input. This type of validation may be considered a form of authorization acted on another user but the requesting user. Query authorization may be implemented for these cases.

## Link collection

Check Confluence for further documentation https://mediapartners.atlassian.net/wiki/spaces/OVIPROAPI/pages/3159490561/Authorization+and+permissions.

Study of the authorizer implementation in the Realty API:
https://mediapartners.atlassian.net/wiki/spaces/OVIPROAPI/pages/3115679753/How+to+implement+API+endpoint+authorizers+-+case+Realty
