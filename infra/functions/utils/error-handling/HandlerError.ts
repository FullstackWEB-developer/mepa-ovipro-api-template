import { EnumErrorCode } from './EnumErrorCode';
import { EnumErrorCodeNumber } from './EnumErrorCodeNumber';
import { EnumErrorMessage } from './EnumErrorMessage';
import { ErrorWrapper } from './ErrorWrapper';

export class HandlerError extends Error {
    message: string;
    statusCode: EnumErrorCodeNumber;
    errorCode: EnumErrorCode;
    description?: string;
    errors?: ErrorWrapper[];

    constructor(
        message: string = EnumErrorMessage.TechnicalError,
        errorCode: EnumErrorCode = EnumErrorCode.TechnicalError,
        description?: string,
        errors?: ErrorWrapper[],
    ) {
        super(message);

        const errorCodeEnumKey = Object.keys(EnumErrorCode)[
            Object.values(EnumErrorCode).indexOf(errorCode)
        ] as keyof typeof EnumErrorCode;
        this.statusCode = EnumErrorCodeNumber[errorCodeEnumKey] ?? 500;

        this.errorCode = errorCode;
        this.description = description;
        if (errors && errors.length) this.errors = errors;
    }
}
