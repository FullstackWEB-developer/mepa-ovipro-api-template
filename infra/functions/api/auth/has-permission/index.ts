import {
    InheritanceType,
    OrganizationPermission,
    OrganizationType,
    Permission,
    PermissionType,
    UserDetails,
} from './userdetails';

export type PermissionToCheck = {
    level: OrganizationType;
    organizationId: string;
    permission: PermissionType;
};

// Check if permissions include a given permission
const checkPermission = (permissions: ReadonlyArray<Permission>, permissionToFind: PermissionType) =>
    permissions.some((p) => p.permission === permissionToFind);

// Check if permissions include INHERIT-type permission
const checkInheritedPermission = (permissions: ReadonlyArray<Permission>, permissionToFind: PermissionType) =>
    permissions.some((p) => p.permission === permissionToFind && p.inheritanceType === InheritanceType.INHERIT);

/**
 * Checks for permission in organization tree
 *
 * Recursive function for finding a specific permission
 * in user's permission tree.
 *
 * @param {PermissionToCheck} permissionToCheck - permission to find
 * @param {$ReadOnly<OrganizationPermission>} current - current object in the tree
 * @param {boolean} permissionInParent - inherited permission already exists in parent permission object
 */
export const checkForPermission = (
    permissionToCheck: PermissionToCheck,
    current: OrganizationPermission,
    permissionInParent = false,
): boolean => {
    const orgInCurrentLevel =
        current.level === permissionToCheck.level && current.id === permissionToCheck.organizationId;
    if (orgInCurrentLevel) {
        return permissionInParent || checkPermission(current.permissions, permissionToCheck.permission);
    } else if (current.children) {
        return !!current.children.find((child) =>
            checkForPermission(
                permissionToCheck,
                child,
                permissionInParent || checkInheritedPermission(current.permissions, permissionToCheck.permission),
            ),
        );
    }
    return false;
};

/**
 * Checks for permission in user object
 *
 * @param {PermissionToCheck} permissionToCheck - permission to find
 * @param {User} user - user object
 */
export const hasPermission = (permission: PermissionToCheck, user: UserDetails | null | undefined): boolean => {
    if (!user) {
        return false;
    }
    return (
        user.organizationPermissionTree &&
        user.organizationPermissionTree.customerGroups.some((cg) => checkForPermission(permission, cg))
    );
};

/**
 * Check if users array of customer group has permissions any organisaation
 * @param {ReadonlyArray<CustomerGroup>} organizationPermission - Array of CustomersGroups
 * @param {PermissionType} permission - type of permission to be checked
 * @returns {boolean}
 */
export const hasPermissionAnywhere =
    (organizationPermission: ReadonlyArray<OrganizationPermission>) =>
    (permission: PermissionType): boolean =>
        organizationPermission.some(
            (permissionTree) =>
                permissionTree.permissions.some((it) => it.permission === permission) ||
                hasPermissionAnywhere(permissionTree.children)(permission),
        );

export const hasAnyPermissionForOrganizationType =
    (organizationPermission: ReadonlyArray<OrganizationPermission>) =>
    (organizationType: OrganizationType): boolean => {
        return organizationPermission.some(
            (permissionTree) =>
                (permissionTree.level === organizationType &&
                    // Check if have any INHERITED permissions on parent organization level
                    !!permissionTree.permissions.length) ||
                (permissionTree.level !== organizationType &&
                    permissionTree.permissions.some(
                        (permission) => permission.inheritanceType === InheritanceType.INHERIT,
                    )) || // No need to check childrens of wanted organization level
                (permissionTree.level !== organizationType &&
                    hasAnyPermissionForOrganizationType(permissionTree.children)(organizationType)),
        );
    };
