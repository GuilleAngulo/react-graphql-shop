import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import { CURRENT_USER_QUERY } from './User';

const ADD_TO_CART_MUTATION = gql`
    mutation ADD_TO_CART_MUTATION($id: ID!) {
        addToCart(id: $id) {
            id
            quantity
            item {
                id
                image
                price
                title
                description
            }
        }
    }
`;

class AddToCart extends React.Component {
    
    static propTypes = {
        item: PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            price: PropTypes.number.isRequired,
            image: PropTypes.string.isRequired,
        }).isRequired,
    };

    update = (cache, payload) => {
        //1. Read the cache
        //console.log('Updating the cart.');
        const data = cache.readQuery({ query: CURRENT_USER_QUERY });
        const { cart } = data.me; 
        const cartItemId = payload.data.addToCart.id;
        //CASE 1 - Updating from optimisticResponse
        if (cartItemId.startsWith('-')) {
            //console.log('1. Optimistic Response.');
            const itemId = payload.data.addToCart.item.id;
            
            const cartItemExists = cart.findIndex(
                cartItem => cartItem.item.id === itemId
            );

            if (cartItemExists === -1)
                cart.push(payload.data.addToCart);
            else
                cart[cartItemExists].quantity += 1;
                
            cache.writeQuery({ query: CURRENT_USER_QUERY, data })
        } 
        //CASE 2 - Updating from the server
        else {
            //console.log('2. Server Update.');
            const cartItemExists = cart.findIndex(
                cartItem => cartItem.id === cartItemId
            );

            if (cartItemExists === -1) {
                cart.push(payload.data.addToCart);
            }  
            else {
                cart.splice(cartItemExists, 1, payload.data.addToCart);
            }
            cache.writeQuery({ query: CURRENT_USER_QUERY, data })
        }
    }

    render() {
        const { id } = this.props.item;
        const { item } = this.props;
        return (
            <Mutation 
            mutation={ADD_TO_CART_MUTATION}
            variables= {{ id }}
            //refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            update={this.update}
            optimisticResponse={{
                __typename: 'Mutation',
                addToCart: {
                    __typename: 'CartItem',
                    id: Math.round(Math.random() * -1000000).toString(),
                    quantity: 1,
                    item,
                },
            }}
            >
                {(addToCart, { loading }) => (
                <button 
                onClick={addToCart}
                disabled={loading}>
                    Add{loading && 'ing'} to Cart 🛒
                </button>
                )}
            </Mutation> 
        );
    }
}

export default AddToCart;
export { ADD_TO_CART_MUTATION };