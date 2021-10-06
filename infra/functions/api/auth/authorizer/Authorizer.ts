import { UserDetails } from '../has-permission/userdetails';

/**
 * Authorization interface for one-to-one relations. The interface relies on
 * {@link UserDetails} and a given target object. You can assert operation rights
 * like modification or view permissions, returning either a boolean or throwing an
 * error. Method names respect the corresponding operation names and are explicitly
 * named by design. This interface may be extended with other operation like delete,
 * ie. canDelete, checkDelete if a separate permission is defined for a delete operation.
 *
 * You can also query an implementation for given type support with
 * {@link supports}. This could be used to implement generic patterns.
 *
 * Internally, a typical authorization pattern is as follows:
 *
 * 1. Find the relation between the subject and the object, e.g. a user and a Realty.
 * 2. Define requirements for authorizing a given operation in the given relation.
 * 3. Verify that the given relation fulfills the requirements.
 */
export interface Authorizer<Item> {
    /**
     * Viewership assertion. Throws a createHttpError.Forbidden when the assertion fails.
     * Chains calls to canAccess by default.
     */
    checkView(user: UserDetails, item: Item): void;

    /**
     * Edit operation assertion. Throws a createHttpError.Forbidden when the assertion fails.
     * Chains calls to canModify by default.
     */
    checkEdit(user: UserDetails, item: Item): void;

    /**
     * View operation check.
     */
    canView(user: UserDetails, item: Item): boolean;

    /**
     * Edit operation check.
     */
    canEdit(user: UserDetails, item: Item): boolean;

    /**
     * Method to check for type support of the concrete implementation.
     */
    supports<T>(type: T): boolean;
}
