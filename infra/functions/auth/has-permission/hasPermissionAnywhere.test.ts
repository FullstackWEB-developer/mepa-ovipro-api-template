import { describe, expect, it } from '@jest/globals';

import { InheritanceType, CustomerGroup, OrganizationUnitLevel, PermissionType } from './userdetails';
import { hasPermissionAnywhere } from './index';

const baseOrganizationPermission: CustomerGroup = {
    id: 1,
    level: OrganizationUnitLevel.CUSTOMER,
    permissions: [],
    children: [],
};

describe(`hasPermissionAnywhere`, () => {
    it('detects permission on base level', () => {
        expect(
            hasPermissionAnywhere([
                {
                    ...baseOrganizationPermission,
                    permissions: [{ permission: PermissionType.PRO_PROPERTY, inheritanceType: InheritanceType.NONE }],
                },
            ])(PermissionType.PRO_PROPERTY),
        ).toEqual(true);
    });

    it('detects permission on child level', () => {
        expect(
            hasPermissionAnywhere([
                {
                    ...baseOrganizationPermission,
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            permissions: [
                                {
                                    permission: PermissionType.PRO_PROPERTY,
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                        },
                    ],
                },
            ])(PermissionType.PRO_PROPERTY),
        ).toEqual(true);
    });

    it('detects permission on sub child level', () => {
        expect(
            hasPermissionAnywhere([
                {
                    ...baseOrganizationPermission,
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            children: [
                                {
                                    ...baseOrganizationPermission,
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
            ])(PermissionType.PRO_PROPERTY),
        ).toEqual(true);
    });

    it('detects missing permission', () => {
        expect(
            hasPermissionAnywhere([
                {
                    ...baseOrganizationPermission,
                    children: [
                        baseOrganizationPermission,
                        {
                            ...baseOrganizationPermission,
                            permissions: [
                                {
                                    permission: PermissionType.PRO_PROPERTY_PRESENTATIONS, // This permission is not checked
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    permissions: [
                                        {
                                            permission: PermissionType.PRO_PROPERTY_PRESENTATIONS, // This permission is not checked
                                            inheritanceType: InheritanceType.NONE,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ])(PermissionType.PRO_PROPERTY),
        ).toEqual(false);
    });
});
