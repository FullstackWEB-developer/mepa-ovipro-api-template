import { APIGatewayEvent } from 'aws-lambda';

export type UserDetails = {
    emailAddress: string;
    accountId: string;
    defaultOfficeId?: string;
    organizationPermissionTree: Readonly<OrganizationPermissionTree>;
    globalPermissions: ReadonlyArray<PermissionType>;
};

export interface OrganizationPermissionTree {
    customerGroups: OrganizationPermission[];
}

export type OrganizationPermission = {
    id: string;
    level: OrganizationType;
    children: ReadonlyArray<OrganizationPermission>;
    permissions: ReadonlyArray<Permission>;
};

export interface Permission {
    inheritanceType: InheritanceType;
    permission: PermissionType;
}

export enum OrganizationType {
    /**
     * The organization unit is a customer group.
     */
    CUSTOMER_GROUP = 'CUSTOMER_GROUP',

    /**
     * The organization unit is a customer.
     */
    CUSTOMER = 'CUSTOMER',

    /**
     * The organization unit is an office.
     */
    OFFICE = 'OFFICE',
}

export enum InheritanceType {
    /**
     * The permission is inherited by organization units which are descendants of the organization unit in which the permission is applied
     */
    INHERIT = 'INHERIT',

    /**
     * The permission is valid only for the organization unit in which the permission is applied
     */
    NONE = 'NONE',
}

export type PermissionType =
    | 'PRO_SELF_VIEWER'
    | 'PRO_VIEWER'
    | 'PRO_PROPERTY'
    | 'PRO_SHOWING_EDIT'
    | 'PRO_EXTRA_VISIBILITY_PURCHASES'
    | 'PRO_USERMANAGEMENT'
    | 'PRO_COMPANYINFOMANAGEMENT'
    | 'PRO_CC_INVOICING'
    | 'PRO_MARKETPLACES'
    | 'PRO_PURCHASE'
    | 'PRO_REPORTS'
    | 'PRO_CUSTOMERS'
    | 'PRO_ASSIGNMENTS'
    | 'PRO_NEWSPAPERADS'
    | 'PRO_INVOICING_VIEW'
    | 'PRO_INVOICING_EDIT'
    | 'PRO_PROPERTY_PRESENTATIONS'
    | 'PRO_MULTIMEDIA_EDIT'
    | 'PRO_ADMIN';

/**
 * Get {@link UserDetails} from APIGatewayEvent or undefined if no user data exists.
 */
export function getUserFromRequest(event: APIGatewayEvent): UserDetails | undefined {
    const userData = event.requestContext.authorizer?.data;
    return userData && JSON.parse(userData);
}
