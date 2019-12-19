import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Error from './ErrorMessage';
import styled from 'styled-components';
import Head from 'next/head';

import formatMoney from '../lib/formatMoney';
import AddToCart from './AddToCart';
import { appTitle } from '../config';

const SingleItemStyles = styled.div`
    max-width: 1200px;
    margin: 2rem auto;
    box-shadow: ${props => props.theme.bs};
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    min-height: 800px;
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        margin: 10px;
    }
    .details {
        margin: 5rem;
        font-size: 2rem;
    }
    p.title {
        background: ${props => props.theme.darkOrange};
        display: inline;
        line-height: 1.3;
        font-size: 4rem;
        text-align: center;
        color: white;
        padding: 0 1rem;
    }
    p.price {
        font-size: 16px;
    }
    .button {
    width: 100%;
    & > * {
      background: ${props => props.theme.lightGrey};
      border: 0;
      font-size: 2rem;
      padding: 1rem;
      cursor: pointer;
      border-radius: 10px;
    }
  }
`;

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: { id: $id }) {
            id
            title
            description
            image
            largeImage
            price
        }
    }
`;

class SingleItem extends Component {
    render() {
        return (
            <Query 
            query={SINGLE_ITEM_QUERY}
            variables={{
                id: this.props.id,
            }}
            >
                {({ error, loading, data }) => {
                    if (error) return <Error error={error} />;
                    if (loading) return <p>Loading...</p>;
                    if (!data.item) return <p>No item found for {this.props.id}</p>
                    const item = data.item;
                    return (
                    <SingleItemStyles>
                        <Head>
                            <title> {appTitle} | {item.title} </title>
                        </Head>
                        <img src={item.largeImage} alt={item.title}/> 
                        <div className="details">
                            <h2 className="title">{item.title}</h2>
                            <p>{item.description}</p>
                            <p className="price">{formatMoney(item.price)}</p>
                            <div className="button">
                                <AddToCart className="add" item={ item }/>
                            </div>
                        </div>
                    </SingleItemStyles>
                    );
                }}
            </Query>
        );
    }
}

export default SingleItem;
export { SINGLE_ITEM_QUERY };