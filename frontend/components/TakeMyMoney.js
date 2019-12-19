import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';
import { stripeKey, currency } from '../config';

const CREATE_ORDER_MUTATION = gql`
    mutation CREATE_ORDER_MUTATION($token: String!) {
        createOrder(token: $token) {
            id
            charge
            total
            items {
                id
                title
            }

        }
    }
`;

function totalItems(cart) {
    return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends React.Component {
    
    onToken = async (res, createOrder) => {
        NProgress.start();
        //console.log('On Token Called');
        //console.log(res.id);
        //Manually call the mutation once the stripe token is received
        const order = await createOrder({
            variables: {
                token: res.id,
            },
        }).catch(err => {
            alert(err.message);
        });
        
        Router.push({
            pathname: '/order',
            query: { id: order.data.createOrder.id},
        });
    };
    
    render() {
        return (
            <User>
                {({ data: { me }, loading }) => {
                    if (loading) return null;
                    return (
                    <Mutation 
                    mutation={CREATE_ORDER_MUTATION}
                    refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
                        {createOrder => (
                        <StripeCheckout
                        amount={calcTotalPrice(me.cart)}
                        name="Sick Fits"
                        description={`Order of ${totalItems(me.cart)} items`}
                        image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
                        stripeKey={stripeKey}
                        currency={currency}
                        email={me.email}
                        token={res => this.onToken(res, createOrder)}
                        >
                            {this.props.children}
                        </StripeCheckout>
                        )}
                    </Mutation>
                    );
                }}
            </User>
        );
    }
}

export default TakeMyMoney;
export { CREATE_ORDER_MUTATION }; 