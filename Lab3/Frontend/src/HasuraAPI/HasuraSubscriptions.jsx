import React, { useState, useEffect } from 'react';
import {
    ApolloClient,
    InMemoryCache,
    split,
    concat,
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
    let { data } = useSubscription(tasksSubscriptions);
    if (isSkip) {
        isSkip = false;
        data = null;
    }
    return (
        <>
            <Layout
                changeToken={props.changeToken}
                data={data}
                skipSub={() => {
                    isSkip = true;
                }}
            />
        </>
    );
}

function Subscription() {
    const [bearerToken, setBearerToken] = useState('');

    const authLink = setContext((_, { headers }) => {
        if (!bearerToken) return { headers };

        return {
            headers: {
                ...headers,
                Authorization: `Bearer ${bearerToken}`,
            },
        };
    });

    const wsLink = new WebSocketLink({
        uri: `wss://${config['link']}`,
        options: {
            reconnect: true,
            connectionParams: () => ({
                headers: {
                    Authorization: `Bearer ${bearerToken}`,
                },
            }),
        },
    });

    const client = new ApolloClient({
        link: concat(authLink, wsLink),
        cache: new InMemoryCache({
            typePolicies: {
                Subscription: {
                    fields: {
                        todos: {
                            merge: false,
                        },
                    },
                },
            },
        }),
    });
    return (
        <ApolloProvider client={client}>
            <LastChanges
                changeToken={token => {
                    setBearerToken(token);
                }}
            />
        </ApolloProvider>
    );
}

export default Subscription;
