import { EnumErrorCode, EnumErrorMessage } from './';

/**
 * Helper class that holds mappings between error codes and error messages
 */
export class ErrorMessageMapping {
    static getInstance(): ErrorMessageMapping {
        if (!ErrorMessageMapping.instance) ErrorMessageMapping.instance = new ErrorMessageMapping();
        return ErrorMessageMapping.instance;
    }

    static getErrorMessage(errorCode: EnumErrorCode): EnumErrorMessage {
        const result = ErrorMessageMapping.getInstance().mapping.get(errorCode);
        if (!result) throw new Error(`No error message found for input error code ${errorCode}`);
        return result;
    }

    private static instance: ErrorMessageMapping;
    private mapping: Map<EnumErrorCode, EnumErrorMessage> = new Map<EnumErrorCode, EnumErrorMessage>();

    private constructor() {
        this.mapping.set(EnumErrorCode.BadRequestBody, EnumErrorMessage.BadRequest);
        this.mapping.set(EnumErrorCode.TechnicalError, EnumErrorMessage.TechnicalError);
        this.mapping.set(EnumErrorCode.Unauthorized, EnumErrorMessage.Unauthorized);
        this.mapping.set(EnumErrorCode.UnsupportedMediaType, EnumErrorMessage.UnsupportedMediaType);
        this.mapping.set(EnumErrorCode.ValueRequired, EnumErrorMessage.ValueRequired);
        this.mapping.set(EnumErrorCode.InvalidApiKey, EnumErrorMessage.InvalidApiKey);
        this.mapping.set(EnumErrorCode.InvalidType, EnumErrorMessage.InvalidType);
        this.mapping.set(EnumErrorCode.InvalidStatus, EnumErrorMessage.InvalidStatus);
        this.mapping.set(EnumErrorCode.InvalidId, EnumErrorMessage.InvalidId);
    }
}
