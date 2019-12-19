import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import { LOCAL_STATE_QUERY } from '../components/Cart';

import { endpoint } from '../config';

function createClient({ headers }) {
  return new ApolloClient({
    uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
    request: operation => {
      operation.setContext({
        fetchOptions: {
          credentials: 'include',
        },
        headers,
      });
    },
    //LOCAL DATA
    clientState: {
      resolvers: {
        Mutation: {
          toogleCart(_, variables, { cache }) {
            //Read the cartOpen value from the cache
            const { cartOpen } = cache.readQuery({
              query: LOCAL_STATE_QUERY,
            });
            //Write the cart State to the opposite
            const data = {
              data: { cartOpen: !cartOpen }
            };
            cache.writeData(data);
            return data;
          },
        },
      },
      defaults: {
        cartOpen: false,
      },
    },
  });
}

export default withApollo(createClient);
