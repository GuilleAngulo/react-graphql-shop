import { mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import wait from 'waait';
import { CURRENT_USER_QUERY } from '../components/User';
import Nav from '../components/Nav';
import { MockedProvider } from 'react-apollo/test-utils';
import { fakeUser, fakeCartItem } from '../lib/testUtils';

const notSignInMocks = [
    {
        request: { query: CURRENT_USER_QUERY},
        result: { data: { me: null } },
    },
];  

const signedInMocks = [
    {
        request: { query: CURRENT_USER_QUERY},
        result: { data: { me: fakeUser() } },
    },
];

const signedInMocksWithCartItems = [
    {
        request: { query: CURRENT_USER_QUERY},
        result: { data: { me: {
            ...fakeUser(),
            cart: [fakeCartItem(), fakeCartItem(), fakeCartItem()],
        } } },
    },
];

describe('<Nav />', () => {
    it('renders a minimal nav when sign out', async () => {
        const wrapper = mount(
        <MockedProvider mocks={notSignInMocks}>
            <Nav />
        </MockedProvider>
        );
    await wait();
    wrapper.update();
    //console.log(wrapper.debug());
    const nav = wrapper.find('ul[data-test="nav"]');
    expect(toJSON(nav)).toMatchSnapshot();
    });

    it('renders full nav when signed in', async () => {
        const wrapper = mount(
        <MockedProvider mocks={signedInMocks}>
            <Nav />
        </MockedProvider>
        );
        await wait();
        wrapper.update();  
        const nav = wrapper.find('ul[data-test="nav"]');
        //With a normal user 6, but as the fakeUser is Admin is 7 with permissions
        expect(nav.children().length).toBe(7);
        expect(nav.text()).toContain('Sign Out');
        //console.log(nav.debug());
        //expect(toJSON(nav)).toMatchSnapshot();
    });


    it('renders the amount of items in the cart', async () => {
        const wrapper = mount(
            <MockedProvider mocks={signedInMocksWithCartItems}>
                <Nav />
            </MockedProvider>
            );
            await wait();
            wrapper.update();  
            const nav = wrapper.find('[data-test="nav"]');
            const count = nav.find('div.count');

            //console.log(nav.debug());
            expect(toJSON(count)).toMatchSnapshot();
    });
});