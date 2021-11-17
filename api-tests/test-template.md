# Test template - Boilerplate

## functional testing
- to ensure that the implementation is working correctly as expected — no bugs!
- to ensure that the implementation is working as specified according to the requirements specification
- to prevent regressions between code merges and releases

##API test actions
- Verify correct HTTP status code
- Verify response payload
- Verify basic performance sanity

##Sunny cases for each endpoint and method
- Basic positive tests
- Extended positive testing with optional parameters
-- We also have more complex content like in residentials where we have to test that content correlates residential category etc., so we need multible Get request tests then
- Negative testing with valid input
- Negative testing with invalid input
- Security, authorization, and permission tests(optional or separate tests)

Let’s assume a subset of our API is the /users endpoint, which includes the following API calls:
1. GET /users:	List all users 
2. GET /users/{id}:	Get user by ID
3. POST /users/:	Create a new user
4. PATCH /users/{id}:	Update user information/rights
5. DELETE /users/{id}:	Delete user

##Rainy day cases, such as
- Authentication errors
- Authorization errors
- Missing request parameters
- Missing request body parameters
- Business validation error cases
- Validations for type errors

##Common files
- Parameters via variables etc for different setup, environments and settings etc
- Resource files: Needed libraries, Python files, Message files(error codes etc) 
