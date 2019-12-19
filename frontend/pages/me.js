import PleaseSignIn from '../components/PleaseSignIn';
import Account from '../components/Account';
import User from '../components/User';

const AccountPage = props => (
    <div>
        <PleaseSignIn>
            <User>
            {({ data: { me } }) => {
                return (
                    <Account user={ me }/>
                );
            }}
            </User>
        </PleaseSignIn>
    </div>
);
    
export default AccountPage;