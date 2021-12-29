import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/database';
import React from 'react';
import Button from '../Button/Button';
import classes from './Layout.scss';
import Home from '../Home/Home';
import Popup from '../Popup/Popup';
import Message from '../Popup/Message';
import Spinner from '../Popup/Spinner';

class Layout extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            authState: {},
            provider: '',
            isLoading: false,
            isError: false,
        };
        this.myRef = React.createRef();
    }

    componentDidMount() {
        this.setState({ provider: new firebase.auth.GoogleAuthProvider() });
        firebase.initializeApp({
            apiKey: 'AIzaSyABJPnlkCs5CTvOojbtJb1CJDdqKgnE6GY',
            authDomain: 'notes-ecba8.firebaseapp.com',
            databaseURL: 'https://notes-ecba8-default-rtdb.firebaseio.com',
            projectId: 'notes-ecba8',
            storageBucket: 'notes-ecba8.appspot.com',
            messagingSenderId: '423215069575',
        });
        firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                const token = await user.getIdToken();
                const idTokenResult = await user.getIdTokenResult();
                const hasuraClaim =
                    idTokenResult.claims['https://hasura.io/jwt/claims'];
                this.props.authState.token = token;
                this.props.changeToken(token);
                if (hasuraClaim) {
                    this.setState({ authState: { status: 'in', user, token } });
                } else {
                    const metadataRef = firebase
                        .database()
                        .ref('metadata/' + user.uid + '/refreshTime');

                    metadataRef.on('value', async data => {
                        if (!data.exists) return;
                        const token = await user.getIdToken(true);
                        this.setState({
                            authState: { status: 'in', user, token },
                        });
                    });
                }
            } else {
                this.setState({ authState: { status: 'out' } });
            }
        });
    }

    signIn = async event => {
        event.preventDefault();
        const { provider } = this.state;
        try {
            this.setState({ isLoading: true });
            await firebase.auth().signInWithPopup(provider);
            this.setState({ isLoading: false });
        } catch (error) {
            this.setState({ isLoading: false, isError: true });
        }
    };

    signOut = async event => {
        event.preventDefault();
        try {
            this.setState({ isLoading: true });
            await firebase.auth().signOut();
            this.setState({ isLoading: false });
        } catch (error) {
            this.setState({ isLoading: false, isError: true });
        }
    };

    handleInputChange = e => {
        const { name, value } = e.target;
        this.setState({
            [name]: value,
        });
    };

    render() {
        const { authState, isLoading, isError } = this.state;
        return (
            <>
                {isLoading ? (
                    <Popup>
                        <Spinner />
                    </Popup>
                ) : null}
                <header>
                    <h1>Notes</h1>
                    <div className={classes.buttonContainer}>
                        {authState?.status === 'in' ? (
                            <button
                                onClick={() => {
                                    this.myRef.current.addNote();
                                }}>
                                Add
                            </button>
                        ) : null}
                        {authState?.status === 'in' ? (
                            <button onClick={this.signOut}> Sign out</button>
                        ) : (
                            <button onClick={this.signIn}> Sign in</button>
                        )}
                    </div>
                </header>
                {authState?.status === 'in' ? (
                    <Home
                        authState={authState}
                        data={this.props.data}
                        skipSub={this.props.skipSub}
                        ref={this.myRef}
                    />
                ) : null}
                {isError ? (
                    <Popup>
                        <Message
                            onClose={() => this.setState({ isError: false })}>
                            <div>Something went wrong</div>
                        </Message>
                    </Popup>
                ) : null}
            </>
        );
    }
}

export default Layout;
