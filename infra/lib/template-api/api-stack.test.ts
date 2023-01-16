import { Template } from 'aws-cdk-lib/assertions';
import { TemplateApiBaseConstruct } from '.';
import { createCdkTestContext } from '../../__test__/context';
import { TemplateApiResourcesStack } from '../api-resources/TemplateApiResourcesStack';

test('sample-api-stack', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const templateApiResourcesStack = new TemplateApiResourcesStack(scope, 'TemplateApiResourcesStack', {
        description: 'Template API resources',
    });

    const templateApiBaseConstruct = new TemplateApiBaseConstruct(scope, 'TemplateApiBaseConstruct', {
        description: 'Template API base stack',
    });

    expect.addSnapshotSerializer({
        test: (val: string) => typeof val === 'string' && !!val.match(/([A-Fa-f0-9]{64})\.(jar|zip)/),
        print: (val) => (typeof val === 'string' ? '"[HASH REMOVED]"' : ''),
    });

    expect.addSnapshotSerializer({
        test: (val: string) => typeof val === 'string' && !!val.match(/(Invoke.\w*)/g),
        print: (val) => (typeof val === 'string' ? '[HASH REMOVED]' : ''),
    });

    const templates = templateApiBaseConstruct.stacks.map((stack) => Template.fromStack(stack));
    // THEN
    templates.forEach((template) => {
        expect(template).toMatchSnapshot();
    });
});
