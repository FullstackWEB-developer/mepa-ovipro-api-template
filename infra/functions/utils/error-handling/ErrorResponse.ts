import { ErrorWrapper } from './ErrorWrapper';

export interface ErrorResponse {
    errorCode: string;
    message: string;
    description?: string;
    errors?: ErrorWrapper[];
}
