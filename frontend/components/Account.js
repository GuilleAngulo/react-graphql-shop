import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import Form from './styles/Form';
import Error from './ErrorMessage';


const UPDATE_USER_MUTATION = gql`
    mutation UPDATE_USER_MUTATION(
        $id: ID!
        $name: String
        $email: String
        $password: String
    ) {
    updateUser(id: $id, name: $name, email: $email, password: $password) {
            id
            name
            email
        }
    }
`;


class Account extends Component {
    
    static propTypes = {
        user: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
        }).isRequired,
    };

    state = { 
        id: this.props.user.id,
        name: this.props.user.name,
        email: this.props.user.email,
    };

    handleChange = e => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    }

    updateUser = async (e, updateUserMutation) => {
        e.preventDefault();
        const res = await updateUserMutation({
            variables: {
                ...this.state,
            },
        });
    }

    render() {
        const { user } = this.props;
        return (
                <Mutation 
                    mutation={ UPDATE_USER_MUTATION }
                    variables={this.state}>
                        {(updateUser, { loading, error }) => user && (
                            <Form 
                            data-test="form"
                            onSubmit={e => this.updateUser(e, updateUser)}>
                                <Error error={error} />
                                <fieldset disabled={loading} aria-busy={loading}>
                                    
                                    <label htmlFor="name">
                                        Name
                                        <input 
                                            type="text" 
                                            id="name" 
                                            name="name" 
                                            placeholder="Name" 
                                            required 
                                            defaultValue={user.name}
                                            onChange={this.handleChange}
                                            />
                                    </label>

                                    <label htmlFor="email">
                                        Email
                                        <input 
                                            type="text" 
                                            id="email" 
                                            name="email" 
                                            placeholder="Email" 
                                            required 
                                            defaultValue={user.email}
                                            onChange={this.handleChange}
                                            />
                                    </label>

                                    <label htmlFor="password">
                                        Your Actual Password
                                        <input 
                                            type="password" 
                                            id="password" 
                                            name="password" 
                                            placeholder="Type your current password" 
                                            required
                                            onChange={this.handleChange}
                                            />
                                    </label>
                                    <button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>
                                </fieldset>
                            </Form>
                        )}    
                    </Mutation>
                
        );
    }
}

export default Account;
export { UPDATE_USER_MUTATION };