import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer} from 'react-apollo';
import Account, { UPDATE_USER_MUTATION } from '../components/Account';
import { fakeUser } from '../lib/testUtils';

const user = fakeUser();
const mocks = [
    {
        request: { query: UPDATE_USER_MUTATION },
        result: { 
            data: {
                me: {
                ...fakeUser(),
                },
            },
        },
    },
];

describe('<Account/>', () => {
    it('renders and matches the snapshot', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <Account user={ {...user }}/>
            </MockedProvider>
        );
        await wait(),
        wrapper.update();
        const form = wrapper.find('form[data-test="form"]');
        expect(toJSON(form)).toMatchSnapshot();
    });
});