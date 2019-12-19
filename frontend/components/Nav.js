import Link from 'next/link';
import { Mutation } from 'react-apollo';
import { TOOGLE_CART_MUTATION } from '../components/Cart';

import NavStyles from './styles/NavStyles';
import User from './User';
import Signout from './Signout';
import CartCount from './CartCount';

const Nav = () => (
    <User>
        {({ data: { me } }) => (
        <NavStyles data-test="nav">
            <Link href="/items">
                <a>Shop</a>
            </Link>
            {me && (
                <>
                    <Link href="/sell">
                        <a>Sell</a>
                    </Link>
                    <Link href="/orders">
                        <a>Orders</a>
                    </Link>
                    <Link href="/me">
                        <a>Account</a>
                    </Link>
                    <Signout />
                    <Mutation mutation={TOOGLE_CART_MUTATION}>
                        {(toogleCart) => (
                            <button onClick={toogleCart}>
                                My Cart
                                <CartCount 
                                count={
                                    me.cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0)
                                }>

                                </CartCount>
                            </button>    
                        )}
                    </Mutation>

                    {/* Permissions tab showed only for ADMIN users */}
                    {(me.permissions.findIndex(permission => permission === 'ADMIN') > - 1) && (
                        <Link href="/permissions">
                            <a>Permissions 🔐</a>
                        </Link>
                    )}


                </>
            )}

            {!me && (
                <Link href="/signup">
                    <a>Sign In</a>
                </Link>
            )}
        </NavStyles>
        )}
    </User> 
);

export default Nav;