import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { ALL_ITEMS_QUERY } from './Items';
//import { PAGINATION_QUERY } from './Pagination';

const DELETE_ITEM_MUTATION = gql`
    mutation DELETE_ITEM_MUTATION($id: ID!) {
        deleteItem(id: $id) {
            id
        }
    }
`;

class DeleteItem extends Component {
    update = (cache, payload) => {
        //Manually update the cache on the client, so it matches the server
        //1. Read the cache for the items we want
        const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
        //In the payload we have the identification of the deleted item
        //2. Filter the deleted item out of the page
        const filteredItems = data.items.filter(item => item.id !== payload.data.deleteItem.id);
        //data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
        //3. Put the items back
        cache.writeQuery({ 
            query: ALL_ITEMS_QUERY, 
            data: { items: filteredItems } 
        });
        //cache.writeQuery({ query: ALL_ITEMS_QUERY, data });

        /**PAGINATION */
        /*const pagination = cache.readQuery({ query: PAGINATION_QUERY});
        pagination.itemsConnection.aggregate.count -= 1;
        cache.writeQuery({ 
            query: PAGINATION_QUERY, 
            data: pagination,
        });*/

    };

    render() {
        return (
            <Mutation 
            mutation={DELETE_ITEM_MUTATION}
            variables={{ id: this.props.id }}
            update={this.update}
            optimisticResponse={{
                __typename: 'Mutation',
                deleteItem: {
                    __typename: 'Item',
                    id: this.props.id,
                },
            }}
            >
                {(deleteItem, { error }) => (
                    <button 
                    onClick={() => {
                        if (confirm('Are you sure you want to delete this item?')) {
                            deleteItem().catch(err => {
                                alert(err.message);
                            });
                        }
                    }}>
                        {this.props.children}
                    </button>
                )}
            </Mutation>
        );
    }
}

export default DeleteItem;