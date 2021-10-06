import { SimpleOffice } from '../../../sample/api/model/entities/SimpleOffice';
import { UserDetails } from '../has-permission/userdetails';

export enum RelationType {
    OWNER = 'OWNER',
    OTHER = 'OTHER',
    NONE = 'NONE',
}

/**
 * Base class for authorizable relations contain a user and an item.
 */
export class Relation<Item> {
    public readonly user: UserDetails;
    public readonly item: Item;
    public readonly relationType: RelationType;

    constructor(user: UserDetails, item: Item, relationType: RelationType) {
        this.user = user;
        this.item = item;
        this.relationType = relationType;
    }
}

/**
 * This is a concrete implementation of {@link Relation} specific to Realty.
 */
export class SampleRelation extends Relation<SimpleOffice> {
    constructor(user: UserDetails, item: SimpleOffice, relationType: RelationType) {
        super(user, item, relationType);
    }
}
