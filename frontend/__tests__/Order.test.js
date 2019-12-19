import { mount } from 'enzyme';
import wait from 'waait';
import toJSON from 'enzyme-to-json';
import { MockedProvider } from 'react-apollo/test-utils';
import { ApolloConsumer} from 'react-apollo';
import { CURRENT_USER_QUERY } from '../components/User';
import { fakeUser, fakeCartItem, fakeItem, fakeOrder } from '../lib/testUtils';
import OrderStyles from '../components/styles/OrderStyles';
import Order, { SINGLE_ORDER_QUERY } from '../components/Order';

const order = fakeOrder();

const mocks = [
    {
        request: { query: SINGLE_ORDER_QUERY, variables: { id: 'ord123' } },
        result: {
            data: {
                order: fakeOrder(),
            },
        },
    },
]

describe('<Order/>', () => {
    it('renders and matches snapshot', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <Order id="ord123"/>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const order = wrapper.find('div[data-test="order"]');
        expect(toJSON(order)).toMatchSnapshot();
    });

    /**
    it('renders the item count and order total properly', async () => {
        const wrapper = mount(
            <MockedProvider mocks={mocks}>
                <Order id="ord123"/>
            </MockedProvider>
        );
        await wait();
        wrapper.update();
        const order = wrapper.find('div[data-test="order"]');
        const orderTotal = order.find('span[data-test="order-total"]');
        const itemCount = wrapper.find('span[data-test="item-count"]');
        console.log(orderTotal.children().text());
        expect(orderTotal.children().text()).toBe(fakeOrder.total);
        expect(itemCount).toBe(fakeOrder.items.length);
    }); 
     */
});