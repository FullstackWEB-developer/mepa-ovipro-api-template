export interface UserDetails {
    emailAddress: string;
    userId: number;
    organizationPermissionTree: OrganizationPermissionTree;
    globalPermissions: any[];
}

export interface OrganizationPermissionTree {
    customerGroups: CustomerGroup[];
}

export interface CustomerGroup {
    id: number;
    level: OrganizationUnitLevel;
    children: CustomerGroup[];
    permissions: Permission[];
}

export interface Permission {
    inheritanceType: InheritanceType;
    permission: PermissionType;
}

export enum OrganizationUnitLevel {
    /**
     * The organization unit is a customer group.
     */
    CUSTOMER_GROUP,

    /**
     * The organization unit is a customer.
     */
    CUSTOMER,

    /**
     * The organization unit is an office.
     */
    OFFICE,
}

export enum InheritanceType {
    /**
     * The permission is inherited by organization units which are descendants of the organization unit in which the permission is applied
     */
    INHERIT,

    /**
     * The permission is valid only for the organization unit in which the permission is applied
     */
    NONE,
}

export enum PermissionType {
    /**
     * Grants user a permission to view one's announcements, customers, and leads.
     */
    PRO_SELF_VIEWER,

    /**
     * Grants user a permission to view announcements, customers, and leads owned by the user's organization unit.
     */
    PRO_VIEWER,

    /**
     * Grants user a permission to create, edit, and publish property ads.
     */
    PRO_PROPERTY,

    /**
     * Grants user a permission to add, edit and delete showing times.
     */
    PRO_SHOWING_EDIT,

    /**
     * Grants user a permission to purchase extra visibility products.
     */
    PRO_EXTRA_VISIBILITY_PURCHASES,

    /**
     * Grants user a permission to create, edit and delete users in the user's organization unit and assign permissions for them.
     */
    PRO_USERMANAGEMENT,

    /**
     * Grants user a permission to edit info of organization unit and for requesting changes to info of organization unit.
     */
    PRO_COMPANYINFOMANAGEMENT,

    /**
     * Grants user a permission to view breakdown of contract invoicing.
     */
    PRO_CC_INVOICING,

    /**
     * Grants user a permission to manage visibility of properties in marketplaces like Etuovi.com.
     */
    PRO_MARKETPLACES,

    /**
     * Grants user a permission to add, edit and delete announcement images, videos etc. media.
     */
    PRO_MULTIMEDIA_EDIT,

    /**
     * Permissions below this are not added to db yet. Needed currently just for tests.
     */

    PRO_PURCHASE,
    PRO_REPORTS,
    PRO_CUSTOMERS,
    PRO_ASSIGNMENTS,
    PRO_NEWSPAPERADS,
    PRO_INVOICING_VIEW,
    PRO_INVOICING_EDIT,
    PRO_PROPERTY_PRESENTATIONS,
    PRO_ADMIN,
}
