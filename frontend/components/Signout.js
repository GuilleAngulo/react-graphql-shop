import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Router from 'next/router';

import { CURRENT_USER_QUERY } from './User';

const SIGNOUT_MUTATION = gql`
    mutation SIGNOUT_MUTATION {
        signout {
            message
        }
    }   
`;

const Signout = props => (
    <Mutation 
    mutation={SIGNOUT_MUTATION}
    refetchQueries={[{ query: CURRENT_USER_QUERY }]}>
        {signout => <button onClick={signout}>Sign Out</button>}
    </Mutation>
);

export default Signout;