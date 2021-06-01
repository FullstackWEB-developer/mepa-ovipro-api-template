import { IExpectations } from './interfaces';

export function loadExpectation(id: string, type: 'input' | 'output' | 'mocks', expectationsPath: string): any {
    // eslint-disable-line
    return require(`${expectationsPath}/${id}.${type}.json`);
}

export function loadExpectations(id: string, expectationsPath: string): IExpectations {
    const input = loadExpectation(id, 'input', expectationsPath);
    const output = loadExpectation(id, 'output', expectationsPath);
    return {
        input,
        output,
    };
}
