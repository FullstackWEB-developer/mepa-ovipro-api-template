import { hasPermissionAnywhere } from './index';
import { InheritanceType, OrganizationPermission, OrganizationType } from './userdetails';

const baseOrganizationPermission: OrganizationPermission = {
    id: '1',
    level: OrganizationType.CUSTOMER,
    permissions: [],
    children: [],
};

describe(`hasPermissionAnywhere`, () => {
    it('detects permission on base level', () => {
        expect(
            hasPermissionAnywhere([
                {
                    ...baseOrganizationPermission,
                    permissions: [{ permission: 'PRO_PROPERTY', inheritanceType: InheritanceType.NONE }],
                },
            ])('PRO_PROPERTY'),
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
                                    permission: 'PRO_PROPERTY',
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                        },
                    ],
                },
            ])('PRO_PROPERTY'),
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
                                            permission: 'PRO_PROPERTY',
                                            inheritanceType: InheritanceType.NONE,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ])('PRO_PROPERTY'),
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
                                    permission: 'PRO_PROPERTY_PRESENTATIONS', // This permission is not checked
                                    inheritanceType: InheritanceType.NONE,
                                },
                            ],
                            children: [
                                {
                                    ...baseOrganizationPermission,
                                    permissions: [
                                        {
                                            permission: 'PRO_PROPERTY_PRESENTATIONS', // This permission is not checked
                                            inheritanceType: InheritanceType.NONE,
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ])('PRO_PROPERTY'),
        ).toEqual(false);
    });
});
