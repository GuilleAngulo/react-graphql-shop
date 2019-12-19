import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer} from 'react-apollo';
import AddToCart, { ADD_TO_CART_MUTATION } from '../components/AddToCart';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem, fakeItem } from '../lib/testUtils';

const item = fakeItem();
const mocks = [
    {
        request: { query: CURRENT_USER_QUERY },
        result: { 
            data: {
                me: {
                ...fakeUser(),
                cart: [],
                },
            },
        },
    },
    /**{
        request: { query: CURRENT_USER_QUERY },
        result: { 
            data: {
                me: {
                ...fakeUser(),
                cart: [fakeCartItem()],
                },
            },
        },
    },**/

    {
        request: { query: ADD_TO_CART_MUTATION, variables: { id: item.id} },
        result: {
            data: {
                addToCart: {
                    ...fakeCartItem(),
                    quantity: 1,
                },
            },
        },
    },
];


describe('<AddToCart/>', () => {
    it('renders and matches the snapshot', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <AddToCart id={item.id} item={{ ...item }}/>
            </MockedProvider>
        );

        await wait(),
        wrapper.update();
        expect(toJSON(wrapper.find('button'))).toMatchSnapshot();
    });

    it('adds an item to cart when clicked', async () => {
        
        let apolloClient;
        
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <ApolloConsumer>
                    {(client) => {
                        apolloClient = client;
                        return  <AddToCart id={item.id} item={{...item}}/>;
                    }}
                </ApolloConsumer>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const { data: { me } } = await apolloClient.query({ query: CURRENT_USER_QUERY });
        expect(me.cart).toHaveLength(0);

        //Add an item to the cart
        wrapper.find('button').simulate('click');
        await wait();

        //Check if the item is in the cart
        const { data: { me: me2 } } = await apolloClient.query({ query: CURRENT_USER_QUERY });
        expect(me2.cart).toHaveLength(1);
        expect(me2.cart[0].id).toBe('omg123');
        expect(me2.cart[0].quantity).toBe(1);
    });

    it('changes from add to adding when clicked', async () => {
        let apolloClient;
        
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <ApolloConsumer>
                    {(client) => {
                        apolloClient = client;
                        return  <AddToCart id={item.id} item={{...item}}/>;
                    }}
                </ApolloConsumer>
            </MockedProvider>
        );

        const { data: { me } } = await apolloClient.query({ query: CURRENT_USER_QUERY });

        await wait();
        wrapper.update();
        expect(wrapper.text()).toContain('Add to Cart');
        wrapper.find('button').simulate('click');
        expect(wrapper.text()).toContain('Adding to Cart');
    });
});