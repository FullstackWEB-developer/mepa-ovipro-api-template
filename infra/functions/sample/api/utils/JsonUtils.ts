/**
 * JSON utilities for the project.
 */
export const JsonUtils = {
    /**
     * JSON.stringify method that includes a cleanup method
     * that drops null fields from the resulting JSON string.
     */
    stringifyClean(value: unknown): string {
        return JSON.stringify(value, cleanUp);
    },
};

const cleanUp = (_key: string, value: unknown): unknown | undefined => {
    return value ?? undefined;
};
