import React from 'react';
import classes from './App.scss';
import { ApolloProvider } from '@apollo/client';
import Subscriptions from './HasuraAPI/HasuraSubscriptions';

function App() {
    return <Subscriptions />;
}

export default App;
