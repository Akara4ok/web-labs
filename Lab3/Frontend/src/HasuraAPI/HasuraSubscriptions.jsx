import React, { useState, useEffect } from 'react';
import {
    ApolloClient,
    InMemoryCache,
    split,
    useSubscription,
    ApolloProvider,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from '@apollo/client/link/ws';
import gql from 'graphql-tag';
import Home from '../Components/Home/Home';
import { config } from './config.js';
import Layout from '../Components/Layout/Layout';
import { setContext } from '@apollo/client/link/context';

let isSkip = false;
let authState = { token: '' };

const tasksSubscriptions = gql`
    subscription tasksSubscriptions {
        ListName(order_by: { Id: asc }) {
            Id
            ListName
            Tasks(order_by: { Id: asc }) {
                Checked
                Id
                IdList
                TaskName
            }
        }
    }
`;

function LastChanges(props) {
    const [token, setToken] = useState('');
    useEffect(() => {
        if (token !== authState?.token) {
            setToken(authState?.token);
            props.changeFlag();
        }
    });
    console.log(':(');
    let { data } = useSubscription(tasksSubscriptions);
    if (isSkip) {
        isSkip = false;
        data = null;
    }
    return (
        <>
            <Layout
                authState={authState}
                data={data}
                skipSub={() => {
                    isSkip = true;
                }}
            />
        </>
    );
}

export default function Subscriptions() {
    const [flag, setFlag] = useState(false);

    const httpLink = new HttpLink({
        uri: `https://${config['link']}`,
    });

    const wsLink = new WebSocketLink({
        uri: `wss://${config['link']}`,
        options: {
            reconnect: true,
            Authorization: `Bearer ${authState?.token}`,
        },
    });

    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers,
                Authorization: `Bearer ${authState?.token}`,
            },
        };
    });

    const link = split(
        ({ query }) => {
            const { kind, operation } = getMainDefinition(query);
            return (
                kind === 'OperationDefinition' && operation === 'subscription'
            );
        },
        wsLink,
        authLink.concat(httpLink),
    );

    const apolloClient = new ApolloClient({
        cache: new InMemoryCache(),
        link,
    });

    return (
        <ApolloProvider client={apolloClient}>
            <LastChanges
                changeFlag={() => {
                    setFlag(!flag);
                }}
            />
        </ApolloProvider>
    );
}
