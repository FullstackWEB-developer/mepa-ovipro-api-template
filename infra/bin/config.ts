import { ProjectProps } from '@almamedia-open-source/cdk-project-context';
import { Accounts } from '@almamedia-open-source/cdk-project-target';

const projectProps: ProjectProps = {
    name: 'ovipro',
    author: {
        organization: 'Alma Mediapartners',
        name: 'OviPRO',
        email: 'etuovi-tekniikka@almamedia.fi',
    },
    defaultRegion: 'eu-west-1',
    accounts: Accounts.three({
        mock: {
            id: '012312312312',
            config: {
                service: 'mock',
                domain: 'mock-ovipro.net',
            },
        },
        dev: {
            id: '675491542586',
            config: {
                service: 'ovipro',
                domain: 'dev-ovipro.net',
            },
        },
        preprod: {
            id: '877450183205',
            config: {
                service: 'ovipro',
                domain: 'preprod-ovipro.net',
            },
        },
        prod: {
            id: '799957131063',
            config: {
                service: 'ovipro',
                domain: 'ovipro.fi',
            },
        },
    }),
};

export default projectProps;
