/**
 * ORM entities are registered globally in this array.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const entities: Function[] = [];

/**
 * This decorator is used to register ORM entities.
 * @example
 * (at)Entity
 * (at)oviproentity
 * public class Plot {
 * }
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const oviproEntity = (target: Function): void => {
    entities.push(target);
};
