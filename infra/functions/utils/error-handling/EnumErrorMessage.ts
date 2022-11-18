export enum EnumErrorMessage {
    BadRequest = 'Bad request',
    MissingMandatoryParameters = 'Missing mandatory parameters',
    ValueRequired = 'Mandatory value missing for the request',
    InvalidRequestParameters = 'Invalid request parameters',
    InvalidRequestBody = 'Invalid request body',
    InvalidType = 'Invalid data type provided for the value in the request',
    Unauthorized = 'Unauthorized request',
    AuthorizationMissingOrFailed = 'Authorization missing or failed',
    NotFound = "The requested resource wasn't found",
    InvalidId = 'Invalid ID',
    InvalidStatus = 'Invalid status',
    InvalidApiKey = 'Missing or invalid API key',
    UnsupportedMediaType = 'Unsupported media type',
    TechnicalError = 'A technical error has occurred',
    TechnicalErrorCustomerSupport = 'A technical error has occurred. Please contact customer support.',
    InvalidLivingAreaInM2 = 'Living area in square meters should be at least 1',
    InvalidTotalAreaInM2 = 'Total area in square meters should be at least 1',
    ShowingStartTimeInPast = 'Unable to delete showing because the starting time has already been passed',
    ShowingAgentRequired = 'Agent role code should be set as SHOWING_AGENT',
}