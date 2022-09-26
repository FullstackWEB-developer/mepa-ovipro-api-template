import { requestIdHeaderAppender } from '../request-id-header-appender';

//
// Tests for the requestIdHeaderAppender middleware.
//

const headerName = 'Request-ID';

describe('request-id-header-appender', () => {
    test('Normalize response when response is undefined', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const event = {} as any;
        requestIdHeaderAppender().after(event);
        expect(event.response.headers).toEqual({});
    });

    test('Append header when request id is set', () => {
        const event = {
            event: {
                headers: {
                    [headerName]: 'tested',
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        requestIdHeaderAppender().after(event);
        expect(event.response.headers[headerName]).toBe('tested');
    });

    test('Expect undefined When request id is in unexpected case', () => {
        const event = {
            event: {
                headers: {
                    [headerName.toLowerCase()]: 'tested',
                },
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        requestIdHeaderAppender().after(event);
        expect(event.response.headers['Request-ID']).toBeUndefined();
    });
});
