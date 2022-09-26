import { EnumErrorCode, ErrorDescriptionFormatters, ErrorWrapper } from '.';

export function createMissingOtherTypeDescription(target: string): ErrorWrapper {
    return new ErrorWrapper(
        EnumErrorCode.ValueRequired,
        ErrorDescriptionFormatters.missingOtherDescription(target),
        'typeOtherDescription',
    );
}

export function createUpperCaseCodeStringFormatError(target: string): ErrorWrapper {
    return new ErrorWrapper(
        EnumErrorCode.BadRequestParameters,
        ErrorDescriptionFormatters.wrongUpperCaseCodeStringFormat(target),
        target,
    );
}
export function createMandatoryFieldError(fieldName: string): ErrorWrapper {
    return new ErrorWrapper(
        EnumErrorCode.ValueRequired,
        ErrorDescriptionFormatters.mandatoryFieldMissing(fieldName),
        fieldName,
    );
}

export function getMissingRequiredFieldError(target: string): ErrorWrapper {
    return new ErrorWrapper(EnumErrorCode.ValueRequired, ErrorDescriptionFormatters.valueRequired(target), target);
}

export function getWrongRealtyTypeError(fieldName: string, realtyTypes: string[]): ErrorWrapper {
    return new ErrorWrapper(
        EnumErrorCode.BadRequestBody,
        ErrorDescriptionFormatters.invalidRealtyType(fieldName, realtyTypes),
    );
}
