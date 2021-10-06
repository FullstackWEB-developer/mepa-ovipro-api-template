import { InheritanceType, OrganizationPermission, OrganizationType } from './userdetails';
import { hasAnyPermissionForOrganizationType } from './index';

const baseOrganizationPermission: OrganizationPermission = {
    id: '1',
    level: OrganizationType.CUSTOMER_GROUP,
    permissions: [],
    children: [],
};

describe(`hasAnyPermissionForOrganizationType`, () => {
    it('detects permission on customerGroup level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [{ permission: 'PRO_PROPERTY', inheritanceType: InheritanceType.NONE }],
                },
            ])(OrganizationType.CUSTOMER_GROUP),
        ).toEqual(true);
    });

    it('detects permission on customer level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationType.CUSTOMER,
                            permissions: [
                                {
                                    permission: 'PRO_PROPERTY',
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationType.CUSTOMER),
        ).toEqual(true);
    });

    it('detects inherited permission from customerGroup on customer level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [
                        {
                            permission: 'PRO_PROPERTY',
                            inheritanceType: InheritanceType.INHERIT,
                        },
                    ],
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationType.CUSTOMER,
                        },
                    ],
                },
            ])(OrganizationType.CUSTOMER),
        ).toEqual(true);
    });

    it('detects permission on office level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationType.CUSTOMER,
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationType.OFFICE,
                                    permissions: [
                                        {
                                            permission: 'PRO_PROPERTY',
                                            inheritanceType: InheritanceType.NONE,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationType.OFFICE),
        ).toEqual(true);
    });

    it('detects inherited permission from customer on office level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationType.CUSTOMER,
                            permissions: [
                                {
                                    permission: 'PRO_PROPERTY',
                                    inheritanceType: InheritanceType.INHERIT,
                                },
                            ],
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationType.OFFICE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationType.OFFICE),
        ).toEqual(true);
    });

    it('detects inherited permission from customerGroup on office level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [
                        {
                            permission: 'PRO_PROPERTY',
                            inheritanceType: InheritanceType.INHERIT,
                        },
                    ],
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationType.CUSTOMER,
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationType.OFFICE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationType.OFFICE),
        ).toEqual(true);
    });

    it('detects no permission for office level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [
                        {
                            permission: 'PRO_PROPERTY_PRESENTATIONS',
                            inheritanceType: InheritanceType.NONE,
                        },
                    ],
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationType.CUSTOMER,
                            permissions: [
                                {
                                    permission: 'PRO_PROPERTY_PRESENTATIONS', // This permission is not checked
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationType.OFFICE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationType.OFFICE),
        ).toEqual(false);
    });
});
