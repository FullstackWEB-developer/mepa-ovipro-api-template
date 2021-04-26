import { describe, expect, it } from '@jest/globals';

import { CustomerGroup, InheritanceType, OrganizationUnitLevel, PermissionType } from './userdetails';
import { hasAnyPermissionForOrganizationType } from './index';

const baseOrganizationPermission: CustomerGroup = {
    id: 1,
    level: OrganizationUnitLevel.CUSTOMER_GROUP,
    permissions: [],
    children: [],
};

describe(`hasAnyPermissionForOrganizationType`, () => {
    it('detects permission on customerGroup level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [{ permission: PermissionType.PRO_PROPERTY, inheritanceType: InheritanceType.NONE }],
                },
            ])(OrganizationUnitLevel.CUSTOMER_GROUP),
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
                            level: OrganizationUnitLevel.CUSTOMER,
                            permissions: [
                                {
                                    permission: PermissionType.PRO_PROPERTY,
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationUnitLevel.CUSTOMER),
        ).toEqual(true);
    });

    it('detects inherited permission from customerGroup on customer level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [
                        {
                            permission: PermissionType.PRO_PROPERTY,
                            inheritanceType: InheritanceType.INHERIT,
                        },
                    ],
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationUnitLevel.CUSTOMER,
                        },
                    ],
                },
            ])(OrganizationUnitLevel.CUSTOMER),
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
                            level: OrganizationUnitLevel.CUSTOMER,
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationUnitLevel.OFFICE,
                                    permissions: [
                                        {
                                            permission: PermissionType.PRO_PROPERTY,
                                            inheritanceType: InheritanceType.NONE,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationUnitLevel.OFFICE),
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
                            level: OrganizationUnitLevel.CUSTOMER,
                            permissions: [
                                {
                                    permission: PermissionType.PRO_PROPERTY,
                                    inheritanceType: InheritanceType.INHERIT,
                                },
                            ],
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationUnitLevel.OFFICE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationUnitLevel.OFFICE),
        ).toEqual(true);
    });

    it('detects inherited permission from customerGroup on office level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [
                        {
                            permission: PermissionType.PRO_PROPERTY,
                            inheritanceType: InheritanceType.INHERIT,
                        },
                    ],
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationUnitLevel.CUSTOMER,
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationUnitLevel.OFFICE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationUnitLevel.OFFICE),
        ).toEqual(true);
    });

    it('detects no permission for office level', () => {
        expect(
            hasAnyPermissionForOrganizationType([
                {
                    ...baseOrganizationPermission,
                    permissions: [
                        {
                            permission: PermissionType.PRO_PROPERTY_PRESENTATIONS,
                            inheritanceType: InheritanceType.NONE,
                        },
                    ],
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            level: OrganizationUnitLevel.CUSTOMER,
                            permissions: [
                                {
                                    permission: PermissionType.PRO_PROPERTY_PRESENTATIONS, // This permission is not checked
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    level: OrganizationUnitLevel.OFFICE,
                                },
                            ],
                        },
                    ],
                },
            ])(OrganizationUnitLevel.OFFICE),
        ).toEqual(false);
    });
});
