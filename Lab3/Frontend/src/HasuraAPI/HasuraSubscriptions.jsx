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
import Layout from '../Components/Layout';

const httpLink = new HttpLink({
    uri: 'https://subtle-dove-32.hasura.app/v1/graphql',
});

const wsLink = new WebSocketLink({
    uri: 'wss://subtle-dove-32.hasura.app/v1/graphql',
    options: {
        reconnect: true,
        connectionParams: {
            headers: {
                'content-type': 'application/json',
                'x-hasura-admin-secret':
                    'SYfy99PqMy0EFUZ2evxFbwe4Q77eIeTdP5tibLRz2M0R1ZMjc8zrc0BEoUl1nm4M',
            },
        },
    },
});

const link = split(
    ({ query }) => {
        const { kind, operation } = getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink,
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

let isSkip = false;

export default function LastChanges() {
    let { data } = useSubscription(tasksSubscriptions);
    if (isSkip) {
        isSkip = false;
        data = null;
    }
    return (
        <Layout
            data={data}
            skipSub={() => {
                isSkip = true;
            }}
        />
    );
}