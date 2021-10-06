import { standardLog } from './logging';

export const ConverterUtils = {
    /**
     * Convert value to given enum type.
     * @param value Convertable enum/union value
     * @param e Target enum type.
     * @returns Match or undefined.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
    convertEnum<E extends { [name: string]: any }, Target>(value: any, e: E): Target {
        const match = Object.values(e).find((item) => item === value);
        if (!match) {
            standardLog.error(`Non-matching enums: ${Object.values(e)} vs. ${value}`);
        }
        return match;
    },
};
