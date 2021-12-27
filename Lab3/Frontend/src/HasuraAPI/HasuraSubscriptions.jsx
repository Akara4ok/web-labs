import React from 'react';
import {
    ApolloClient,
    InMemoryCache,
    split,
    useSubscription,
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

const httpLink = new HttpLink({
    uri: `https://${config['link']}`,
});

const wsLink = new WebSocketLink({
    uri: `wss://${config['link']}`,
    options: {
        reconnect: true,
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
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    authLink.concat(httpLink),
);

export const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    link,
});

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

export default function LastChanges() {
    let { data } = useSubscription(tasksSubscriptions);
    console.log(authState);
    console.log(data);
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
