import { hasPermission } from './index';
import { InheritanceType, OrganizationType, UserDetails } from './userdetails';

const emptyUser: UserDetails = {
    emailAddress: 'empty@user.test',
    accountId: '1',
    organizationPermissionTree: {
        customerGroups: [],
    },
    globalPermissions: ['PRO_SELF_VIEWER'],
};

const officeUser: UserDetails = {
    emailAddress: 'office@user.test',
    accountId: '2',
    organizationPermissionTree: {
        customerGroups: [
            {
                id: '1',
                level: OrganizationType.CUSTOMER_GROUP,
                children: [
                    {
                        id: '3',
                        level: OrganizationType.CUSTOMER,
                        children: [
                            {
                                id: '14',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [
                                    {
                                        permission: 'PRO_PROPERTY',
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                    {
                                        permission: 'PRO_EXTRA_VISIBILITY_PURCHASES',
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                ],
                            },
                            {
                                id: '13',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [
                                    {
                                        permission: 'PRO_PROPERTY',
                                        inheritanceType: InheritanceType.NONE,
                                    },
                                    {
                                        permission: 'PRO_SHOWING_EDIT',
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
    accountId: '3',
    organizationPermissionTree: {
        customerGroups: [
            {
                id: '1',
                level: OrganizationType.CUSTOMER_GROUP,
                children: [
                    {
                        id: '3',
                        level: OrganizationType.CUSTOMER,
                        children: [
                            {
                                id: '14',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: '13',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [
                            {
                                permission: 'PRO_PROPERTY',
                                inheritanceType: InheritanceType.INHERIT,
                            },
                            {
                                permission: 'PRO_EXTRA_VISIBILITY_PURCHASES',
                                inheritanceType: InheritanceType.NONE,
                            },
                            {
                                permission: 'PRO_VIEWER',
                                inheritanceType: InheritanceType.INHERIT,
                            },
                            {
                                permission: 'PRO_SHOWING_EDIT',
                                inheritanceType: InheritanceType.INHERIT,
                            },
                        ],
                    },
                    {
                        id: '5',
                        level: OrganizationType.CUSTOMER,
                        children: [
                            {
                                id: '24',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: '23',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [
                            {
                                permission: 'PRO_SHOWING_EDIT',
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
    accountId: '3',
    organizationPermissionTree: {
        customerGroups: [
            {
                id: '1',
                level: OrganizationType.CUSTOMER_GROUP,
                children: [
                    {
                        id: '3',
                        level: OrganizationType.CUSTOMER,
                        children: [
                            {
                                id: '14',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: '13',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [],
                    },
                ],
                permissions: [
                    {
                        permission: 'PRO_PROPERTY',
                        inheritanceType: InheritanceType.NONE,
                    },
                    {
                        permission: 'PRO_EXTRA_VISIBILITY_PURCHASES',
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: 'PRO_VIEWER',
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: 'PRO_SHOWING_EDIT',
                        inheritanceType: InheritanceType.INHERIT,
                    },
                ],
            },
            {
                id: '2',
                level: OrganizationType.CUSTOMER_GROUP,
                children: [
                    {
                        id: '4',
                        level: OrganizationType.CUSTOMER,
                        children: [
                            {
                                id: '15',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                            {
                                id: '16',
                                level: OrganizationType.OFFICE,
                                children: [],
                                permissions: [],
                            },
                        ],
                        permissions: [],
                    },
                ],
                permissions: [
                    {
                        permission: 'PRO_PROPERTY',
                        inheritanceType: InheritanceType.NONE,
                    },
                    {
                        permission: 'PRO_EXTRA_VISIBILITY_PURCHASES',
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: 'PRO_VIEWER',
                        inheritanceType: InheritanceType.INHERIT,
                    },
                    {
                        permission: 'PRO_SHOWING_EDIT',
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
                        organizationId: '1',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: '2',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
        });
        it('should fail with wrong organization id', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
        });
        it('should fail with missing permission', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '1',
                        permission: 'PRO_PURCHASE',
                        level: OrganizationType.CUSTOMER_GROUP,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
        });
        it('should fail with customer level permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '1',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER_GROUP,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should fail with office level permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '14',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER_GROUP,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should fail with empty organization tree', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '14',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER_GROUP,
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
                        organizationId: '3',
                        permission: 'PRO_PROPERTY',
                        level: OrganizationType.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: '5',
                        permission: 'PRO_SHOWING_EDIT',
                        level: OrganizationType.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(true);
        });
        it('should fail with wrong organization id', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '2',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should fail with missing permission', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '5',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should succeed with inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
        });
        it('should fail with not-inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_PROPERTY',
                        level: OrganizationType.CUSTOMER,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
        });
        it('should fail with only office level permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should fail with empty organization tree', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.CUSTOMER,
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
                        organizationId: '14',
                        permission: 'PRO_PROPERTY',
                        level: OrganizationType.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: '13',
                        permission: 'PRO_SHOWING_EDIT',
                        level: OrganizationType.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(true);
        });
        it('should fail with wrong organization id', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '2',
                        permission: 'PRO_PROPERTY',
                        level: OrganizationType.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should fail with missing permission', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '14',
                        permission: 'PRO_SHOWING_EDIT',
                        level: OrganizationType.OFFICE,
                    },
                    officeUser,
                ),
            ).toEqual(false);
        });
        it('should succeed with inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '13',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.OFFICE,
                    },
                    customerGroupUser,
                ),
            ).toEqual(true);
            expect(
                hasPermission(
                    {
                        organizationId: '14',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.OFFICE,
                    },
                    customerUser,
                ),
            ).toEqual(true);
        });
        it('should fail with not-inherited permissions', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_PROPERTY',
                        level: OrganizationType.OFFICE,
                    },
                    customerGroupUser,
                ),
            ).toEqual(false);
            expect(
                hasPermission(
                    {
                        organizationId: '24',
                        permission: 'PRO_PROPERTY',
                        level: OrganizationType.OFFICE,
                    },
                    customerUser,
                ),
            ).toEqual(false);
        });
        it('should fail with empty organization tree', () => {
            expect(
                hasPermission(
                    {
                        organizationId: '3',
                        permission: 'PRO_VIEWER',
                        level: OrganizationType.OFFICE,
                    },
                    emptyUser,
                ),
            ).toEqual(false);
        });
    });
});
