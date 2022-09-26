import { EnumErrorCode } from './EnumErrorCode';

export class ErrorWrapper {
    target?: string;
    errorCode: EnumErrorCode;
    message: string;
    name?: string;

    constructor(errorCode: EnumErrorCode, message: string, target?: string, name?: string) {
        this.errorCode = errorCode;
        this.message = message;
        if (target) this.target = target;
        if (name) this.name = name;
    }
}
