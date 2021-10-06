import createHttpError from 'http-errors';
import { checkForPermission } from '../has-permission';
import { Authorizer } from './Authorizer';
import { Relation, RelationType } from './Relation';
import { OrganizationType, PermissionType, UserDetails } from '../has-permission/userdetails';
import { SimpleOffice } from '../../../sample/api/model/entities/SimpleOffice';

export class SampleAuthorizer implements Authorizer<SimpleOffice> {
    public static readonly INSTANCE = new SampleAuthorizer();

    private constructor() {
        // Singleton pattern.
    }

    checkView(user: UserDetails, item: SimpleOffice): void {
        if (!this.canView(user, item)) throw new createHttpError.Forbidden();
    }

    checkEdit(user: UserDetails, item: SimpleOffice): void {
        if (!this.canEdit(user, item)) throw new createHttpError.Forbidden();
    }

    canView(user: UserDetails, item: SimpleOffice): boolean {
        return this.canViewRelation(this.findRelation(user, item));
    }

    canEdit(user: UserDetails, item: SimpleOffice): boolean {
        return this.canEditRelation(this.findRelation(user, item));
    }

    canViewRelation(relation: Relation<SimpleOffice>): boolean {
        const { anyRequiredPermission } = this.resolveRequirements();
        return this.hasRequirements(relation, anyRequiredPermission);
    }

    canEditRelation(relation: Relation<SimpleOffice>): boolean {
        const { anyRequiredPermission } = this.resolveRequirements();
        return this.hasRequirements(relation, anyRequiredPermission);
    }

    findRelation(user: UserDetails, item: SimpleOffice): Relation<SimpleOffice> {
        return new Relation<SimpleOffice>(user, item, RelationType.OTHER);
    }

    supports<T>(type: T): boolean {
        return type instanceof SimpleOffice;
    }

    private resolveRequirements(): { anyRequiredPermission: PermissionType[] } {
        return {
            anyRequiredPermission: ['PRO_PROPERTY', 'PRO_ADMIN'],
        };
    }

    private hasRequirements(relation: Relation<SimpleOffice>, anyRequiredPermission: PermissionType[]): boolean {
        const { item, user } = relation;
        return (
            (user.globalPermissions.some((permission) => permission === 'PRO_ADMIN') &&
                anyRequiredPermission.includes('PRO_ADMIN')) ||
            user.organizationPermissionTree.customerGroups.some((customerGroup) => {
                return anyRequiredPermission.some((permission) =>
                    checkForPermission(
                        {
                            level: OrganizationType.OFFICE,
                            organizationId: item.publicId,
                            permission,
                        },
                        customerGroup,
                        customerGroup.permissions.some((permissionLocal) =>
                            anyRequiredPermission.includes(permissionLocal.permission),
                        ),
                    ),
                );
            })
        );
    }
}
