import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

import Table from './styles/Table';
import SickButton from './styles/SickButton';
import Error from './ErrorMessage';


const UPDATE_PERMISSIONS_MUTATION = gql`
    mutation UPDATE_PERMISSIONS_MUTATION($permissions: [Permission], $userId: ID!) {
        updatePermissions(permissions: $permissions, userId: $userId) {
            id
            permissions
            name
            email
        }
    }
`;

const ALL_PERMISSIONS = gql`
    query ALL_PERMISSIONS {
        __type(name: "Permission") {
            name
            enumValues {
                name
            }
        }
    }
`;


const ALL_USERS_QUERY = gql`
    query ALL_USERS_QUERY {
        users {
            id
            name
            email
            permissions
        }
    }
`;


const Permissions = props => (
    <Query query={ALL_USERS_QUERY}>
        {({data, loading, error}) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <Error error={error} />;
        return (
            <div>
                <div>
                <h2>Manage Permissions</h2>
                <Table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <Query query={ALL_PERMISSIONS}>
                                {({data, loading, error}) => {
                                    if (loading) return <th>Loading...</th>;
                                    if (error) return  <th><Error error={error} /></th>;
                                    if (!data) return (<th>No permissions found.</th>);   
                                    return data.__type.enumValues.map(permission => <th key={permission.name}>{permission.name}</th>);
                                }}
                            </Query>
                            <th>👇</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map(user => <UserPermissions key={user.id} user={user} />)}
                    </tbody>
                </Table>
                </div>
            </div>
        );
        }}
    </Query>
);

class UserPermissions extends React.Component {
    static propTypes = {
        user: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            id: PropTypes.string,
            permissions: PropTypes.array,
        }).isRequired,
    };

    state = {
        permissions: this.props.user.permissions,
    }

    handlePermissionChange = (e) => {
    /*In case is required to call the function inside the onChange function
    handlePermissionChange = (e, updatePermissions) => { */
        //console.log(e.target.value);
        //console.log(e.target.checked);
        const checkbox = e.target;
        //Take a copy of the current permissions
        let updatedPermissions = [...this.state.permissions];
        //Figure out if it needs to remove or add this permission
        if (checkbox.checked) {
            //Add it in
            updatedPermissions.push(checkbox.value);
        } else {
            updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
        }
        this.setState({ permissions: updatedPermissions });

        /**In case wanting the onChange checkbox to update permissions
        We need to pass the function as a callback because setState is 
        asynchronous, so can be runing before the update call
        this.setState({ permissions: updatedPermissions }, function() {
            updatePermissions();
        });
        
        AT ONCHANGE SECTION 
        onChange={(e) => this.handlePermissionChange(e, updatePermissions)}
        **/
    }
    
    render() {
        const user = this.props.user;
        return (
            <Mutation mutation={UPDATE_PERMISSIONS_MUTATION}
            variables={{
                permissions: this.state.permissions,
                userId: this.props.user.id,
            }}>
                {(updatePermissions, { loading, error }) => (
                <>
                { error && <tr><td colspan="8"><Error error={error} /></td></tr> }
                <tr>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <Query query={ALL_PERMISSIONS}>
                        {({data, loading, error}) => {
                            if (loading) return <th>Loading...</th>;
                            if (error) return  <Error error={error} />;
                            if (!data) return (<th>No permissions found.</th>);   
                            return data.__type.enumValues.map(permission => 
                                <td key={permission.name}>
                                    <label htmlFor={`${user.id}-permission-${permission.name}`}>
                                        <input
                                        id={`${user.id}-permission-${permission.name}`} 
                                        type="checkbox" 
                                        checked={this.state.permissions.includes(permission.name)}
                                        value={permission.name}
                                        onChange={this.handlePermissionChange}/>
                                    </label>
                                </td>
                            );
                        }}
                    </Query>
                    <td>
                        <SickButton
                        type="button"
                        disabled={loading}
                        onClick={updatePermissions}>
                            Updat{loading ? 'ing' : 'e' }
                        </SickButton>
                    </td>
                </tr>
                </>
                )}
            </Mutation>
        );
    }
}

export default Permissions;