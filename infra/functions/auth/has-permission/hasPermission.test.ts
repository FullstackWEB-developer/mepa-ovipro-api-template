import { describe, expect, it } from '@jest/globals';
import { hasPermission } from './index';
import { InheritanceType, OrganizationUnitLevel, PermissionType, UserDetails } from './userdetails';

const emptyUser: UserDetails = {
    emailAddress: 'empty@user.test',
    userId: 1,
    organizationPermissionTree: {
        customerGroups: [],
    },
    globalPermissions: [PermissionType.PRO_SELF_VIEWER],
};

const officeUser: UserDetails = {
    emailAddress: 'office@user.test',
    userId: 2,
    organizationPermissionTree: {
        customerGroups: [
            {
                id: 1,
                level: OrganizationUnitLevel.CUSTOMER_GROUP,
                children: [
                    {
                        id: 3,
                        level: OrganizationUnitLevel.CUSTOMER,
                        children: [
                            {
                                id: 14,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [
                                    {
                                        permission: PermissionType.PRO_PROPERTY,
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                    {
                                        permission: PermissionType.PRO_EXTRA_VISIBILITY_PURCHASES,
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                ],
                            },
                            {
                                id: 13,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [
                                    {
                                        permission: PermissionType.PRO_PROPERTY,
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                    {
                                        permission: PermissionType.PRO_SHOWING_EDIT,
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                ],
                            },
                        ],
                        permissions: [],
                    },
                ],
                permissions: [],
            },
        ],
    },
    globalPermissions: ['PRO_SELF_VIEWER'],
};

const customerUser: UserDetails = {
    emailAddress: 'customer@user.test',
    userId: 3,
    organizationPermissionTree: {
        customerGroups: [
            {
                id: 1,
                level: OrganizationUnitLevel.CUSTOMER_GROUP,
                children: [
                    {
                        id: 3,
                        level: OrganizationUnitLevel.CUSTOMER,
                        children: [
                            {
                                id: 14,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: 13,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [
                            {
                                permission: PermissionType.PRO_PROPERTY,
                                inheritanceType: InheritanceType.INHERIT,
                            },
                            {
                                permission: PermissionType.PRO_EXTRA_VISIBILITY_PURCHASES,
                                inheritanceType: InheritanceType.NONE,
                            },
                            {
                                permission: PermissionType.PRO_VIEWER,
                                inheritanceType: InheritanceType.INHERIT,
                            },
                            {
                                permission: PermissionType.PRO_SHOWING_EDIT,
                                inheritanceType: InheritanceType.INHERIT,
                            },
                        ],
                    },
                    {
                        id: 5,
                        level: OrganizationUnitLevel.CUSTOMER,
                        children: [
                            {
                                id: 24,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: 23,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [
                            {
                                permission: PermissionType.PRO_SHOWING_EDIT,
                                inheritanceType: InheritanceType.INHERIT,
                            },
                        ],
                    },
                ],
                permissions: [],
            },
        ],
    },
    globalPermissions: ['PRO_SELF_VIEWER'],
};

const customerGroupUser: UserDetails = {
    emailAddress: 'cg@user.test',
    userId: 3,
    organizationPermissionTree: {
        customerGroups: [
            {
                id: 1,
                level: OrganizationUnitLevel.CUSTOMER_GROUP,
                children: [
                    {
                        id: 3,
                        level: OrganizationUnitLevel.CUSTOMER,
                        children: [
                            {
                                id: 14,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: 13,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [],
                    },
                ],
                permissions: [
                    {
                        permission: PermissionType.PRO_PROPERTY,
                        inheritanceType: InheritanceType.NONE,
                    },
                    {
                        permission: PermissionType.PRO_EXTRA_VISIBILITY_PURCHASES,
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: PermissionType.PRO_VIEWER,
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: PermissionType.PRO_SHOWING_EDIT,
                        inheritanceType: InheritanceType.INHERIT,
                    },
                ],
            },
            {
                id: 2,
                level: OrganizationUnitLevel.CUSTOMER_GROUP,
                children: [
                    {
                        id: 4,
                        level: OrganizationUnitLevel.CUSTOMER,
                        children: [
                            {
                                id: 15,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: 16,
                                level: OrganizationUnitLevel.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [],
                    },
                ],
                permissions: [
                    {
                        permission: PermissionType.PRO_PROPERTY,
                        inheritanceType: InheritanceType.NONE,
                    },
                    {
                        permission: PermissionType.PRO_EXTRA_VISIBILITY_PURCHASES,
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: PermissionType.PRO_VIEWER,
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: PermissionType.PRO_SHOWING_EDIT,
                        inheritanceType: InheritanceType.INHERIT,
                    },
                ],
            },
        ],
    },
    globalPermissions: ['PRO_SELF_VIEWER'],
};

describe(`hasPermission`, () => {
    describe('customer groups', () => {
        it('should succeed with customergroup level', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 1,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: 2,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
        });
        it('should fail with wrong organization id', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
        });
        it('should fail with missing permission', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 1,
                        permission: PermissionType.PRO_PURCHASE,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
        });
        it('should fail with customer level permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 1,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should fail with office level permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 14,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should fail with empty organization tree', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 14,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER_GROUP,
                    },
                    emptyUser,
                ),
            ).toEqual(false);
        });
    });
    describe('customers', () => {
        it('should succeed with customer level', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_PROPERTY,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: 5,
                        permission: PermissionType.PRO_SHOWING_EDIT,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(true);
        });
        it('should fail with wrong organization id', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 2,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should fail with missing permission', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 5,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should succeed with inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
        });
        it('should fail with not-inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_PROPERTY,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
        });
        it('should fail with only office level permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should fail with empty organization tree', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.CUSTOMER,
                    },
                    emptyUser,
                ),
            ).toEqual(false);
        });
    });
    describe('offices', () => {
        it('should succeed with office level', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 14,
                        permission: PermissionType.PRO_PROPERTY,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: 13,
                        permission: PermissionType.PRO_SHOWING_EDIT,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(true);
        });
        it('should fail with wrong organization id', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 2,
                        permission: PermissionType.PRO_PROPERTY,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should fail with missing permission', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 14,
                        permission: PermissionType.PRO_SHOWING_EDIT,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should succeed with inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 13,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: 14,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    customerUser,
                ),
            ).toEqual(true);
        });
        it('should fail with not-inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_PROPERTY,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
            expect(
                hasPermission(
                    {
                        organizationId: 24,
                        permission: PermissionType.PRO_PROPERTY,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should fail with empty organization tree', () => {
            expect(
                hasPermission(
                    {
                        organizationId: 3,
                        permission: PermissionType.PRO_VIEWER,
                        level: OrganizationUnitLevel.OFFICE,
                    },
                    emptyUser,
                ),
            ).toEqual(false);
        });
    });
});
