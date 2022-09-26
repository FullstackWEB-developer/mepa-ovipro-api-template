export class ErrorDescriptionFormatters {
    static valueRequired(parameterName: string): string {
        return `Mandatory request parameter ${parameterName} is missing`;
    }

    static invalidType(parameterName: string, parameterType: string): string {
        return `Request parameter ${parameterName} must be a ${parameterType}`;
    }

    static invalidStatus(entityName: string, status: string): string {
        return `Unable to delete a ${entityName} which has a ${status} status`;
    }

    static formatError(message: string, description: string): string {
        return `${message}. ${description}.`;
    }

    static missingOtherDescription(entityName: string): string {
        return `Mandatory field ${entityName} other description is missing`;
    }

    static mandatoryFieldMissing(fieldName: string): string {
        return `Mandatory field ${fieldName} is missing`;
    }
    static invalidRealtyType(fieldName: string, realtyTypes: string[]): string {
        return `Wrong realty type, ${fieldName} should be one of : ${realtyTypes}`;
    }

    static missingUserData(requestContext: any): string {
        // todo: update
        return `Missing user data for request context ${requestContext}`;
    }

    static authorizationFailed(userAccountId: string, realtyPublicId: string): string {
        return `Authorization failed for ${userAccountId} on realty ${realtyPublicId}`;
    }

    static realtyNotFound(realtyPublicId: string): string {
        return `Realty with public id ${realtyPublicId} not found`;
    }

    static businessUsersNotFound(businessUserIds: string[]): string {
        const singularOrPluralForm = businessUserIds.length === 1 ? 'business user was' : 'business users were';
        return `The following ${singularOrPluralForm} not found: ${businessUserIds.join(', ')}`;
    }

    static agencyOfficeNotFound(agencyOfficeId: string): string {
        return `Agency office with public id ${agencyOfficeId} not found`;
    }

    static wrongUpperCaseCodeStringFormat(fieldName: string): string {
        return `Wrong ${fieldName} format, it should only contain uppercase letters and underscores;`;
    }
}
