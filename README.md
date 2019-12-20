# TROPI - A React, GraphQL, Next and Apollo example Shop
The application implements a basic shop, where a user can create an account and make an order by adding items to his cart. Also is possible to manage items (creating, deleting and updating them) depending on users permissions. 

## Structure
### Interface (Frontend)
For building the interface in React.js, it is used the framework [Next.js](https://nextjs.org/) for things as rendering and routing. In styling it is used [Styled Components](https://www.styled-components.com/). As the application uses Apollo Client, also it uses [React-Apollo](https://github.com/apollographql/react-apollo) for interfacing with it. For image hosting the service used is [Cloudinary](https://cloudinary.com/). Also it used a cool progress bar, [NProgress](https://ricostacruz.com/nprogress/). Finally, in the testing area it used [Jest](https://jestjs.io/) with [Enzyme](https://airbnb.io/enzyme/).

### Apollo Client
The app makes use of Apollo Client for data management purpose. It provides tools as performing both GraphQL queries and mutations, catching the data and managing local state. One tool is the hability to perform an optimistic response update, anticipating the server response in order to make the app faster (used at cart when adding or removing items). Finally gives the tools to manage error and loading states to give a better UI experience.

## Tech Stack
<img src="https://github.com/GuilleAngulo/react-graphql-shop/blob/master/frontend/snapshots/techs-stack.png" width="1000">

## Screenshots
<img src="https://github.com/GuilleAngulo/react-graphql-shop/blob/master/frontend/snapshots/home-shot.png" width="400">
<img src="https://github.com/GuilleAngulo/react-graphql-shop/blob/master/frontend/snapshots/cart-shot.png" width="400">

## Live Demo
You can test it [here](https://tropi-react-prod.herokuapp.com/)
