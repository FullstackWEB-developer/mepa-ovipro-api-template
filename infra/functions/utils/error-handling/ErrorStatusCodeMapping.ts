import { EnumErrorCode, EnumErrorCodeNumber } from './';

/**
 * Helper class that holds mappings between error codes strings and their associated numerical value
 */
export class ErrorStatusCodeMapping {
    static getInstance(): ErrorStatusCodeMapping {
        if (!ErrorStatusCodeMapping.instance) ErrorStatusCodeMapping.instance = new ErrorStatusCodeMapping();
        return ErrorStatusCodeMapping.instance;
    }

    static getErrorCodeNumber(errorCode: EnumErrorCode): EnumErrorCodeNumber {
        const result = ErrorStatusCodeMapping.getInstance().mapping.get(errorCode);
        if (!result) throw new Error(`No error code number found for input error code ${errorCode}`);
        return result;
    }
    private static instance: ErrorStatusCodeMapping;
    private mapping: Map<EnumErrorCode, number> = new Map<EnumErrorCode, number>();

    private constructor() {
        this.mapping.set(EnumErrorCode.BadRequestBody, EnumErrorCodeNumber.BadRequestBody);
        this.mapping.set(EnumErrorCode.BadRequestParameters, EnumErrorCodeNumber.BadRequestParameters);
        this.mapping.set(EnumErrorCode.TechnicalError, EnumErrorCodeNumber.TechnicalError);
        this.mapping.set(EnumErrorCode.Unauthorized, EnumErrorCodeNumber.Unauthorized);
        this.mapping.set(EnumErrorCode.UnsupportedMediaType, EnumErrorCodeNumber.UnsupportedMediaType);
        this.mapping.set(EnumErrorCode.ValueRequired, EnumErrorCodeNumber.ValueRequired);
        this.mapping.set(EnumErrorCode.InvalidApiKey, EnumErrorCodeNumber.InvalidApiKey);
        this.mapping.set(EnumErrorCode.NotFound, EnumErrorCodeNumber.NotFound);
        this.mapping.set(EnumErrorCode.InvalidType, EnumErrorCodeNumber.InvalidType);
        this.mapping.set(EnumErrorCode.InvalidStatus, EnumErrorCodeNumber.InvalidStatus);
        this.mapping.set(EnumErrorCode.InvalidId, EnumErrorCodeNumber.InvalidId);
    }
}
