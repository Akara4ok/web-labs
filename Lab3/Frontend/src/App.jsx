import React from 'react';
import classes from './App.scss';
import LastChanges from './HasuraAPI/HasuraSubscriptions';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './HasuraAPI/HasuraSubscriptions';

function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <LastChanges />
        </ApolloProvider>
    );
}

export default App;
