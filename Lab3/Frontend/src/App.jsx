import React from 'react';
import classes from './App.scss';
import axios from 'axios';
import NoteList from 'NoteList';
import Layout from './Layout';
import LastChanges from './HasuraSubscriptions';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './HasuraSubscriptions';

function App() {
    return (
        <ApolloProvider client={apolloClient}>
            <LastChanges />
        </ApolloProvider>
    );
}

export default App;
