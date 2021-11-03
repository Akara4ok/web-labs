import React from 'react';
import classes from './SendMailForm.scss';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import Spinner from '../Popup/Spinner';
import Popup from '../Popup/Popup';
import Message from '../Popup/Message';
import axios from 'axios';

class SendMailForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isRequest: false,
            messages: '[]',
            isSuccess: false,
            isPopupOnScreen: false,
            isRateLimit: false,
            name: '',
            email: '',
            message: '',
        };
    }

    handleSubmit = event => {
        event.preventDefault();
        const {
            isRequest,
            messages,
            isSuccess,
            isPopupOnScreen,
            isRateLimit,
            name,
            email,
            message,
        } = this.state;
        this.setState({ isRequest: true });
        this.setState({ isPopupOnScreen: true });
        axios
            .post('/api', {
                name,
                email,
                message,
            })
            .then(res => {
                this.setState({
                    messages: res.data.messages,
                    isSuccess: res.data.isSuccess,
                    name: '',
                    email: '',
                    message: '',
                });

                console.log(res.data.isSuccess);
            })
            .catch(error => {
                this.setState({
                    isRequest: false,
                    isSuccess: false,
                });

                if (!error.response.data || error.response.status !== 429) {
                    this.setState({
                        messages: '["Something went wrong..."]',
                    });
                    return;
                }
                this.setState({
                    messages: error.response.data,
                });
            });
    };

    onOkClicked = () => {
        this.setState({ isPopupOnScreen: false });
    };

    render() {
        const { name, email, message } = this.state;

        return (
            <div>
                <form method="POST" onSubmit={this.handleSubmit}>
                    <InputField
                        label="Name: "
                        type="text"
                        name="name"
                        defaultValue="Enter your name"
                        value={name}
                        onChange={newName => this.setState({ name: newName })}
                    />
                    <InputField
                        label="E-mail: "
                        type="email"
                        name="email"
                        defaultValue="Enter e-mail"
                        value={email}
                        onChange={newEmail =>
                            this.setState({ email: newEmail })
                        }
                    />
                    <TextAreaField
                        label="Your message: "
                        defaultValue="Enter your message"
                        value={message}
                        onChange={newMessage =>
                            this.setState({ message: newMessage })
                        }
                    />
                    <input
                        type="submit"
                        value="Submit"
                        disabled={this.state.isRequest}
                        className={classes.button}
                    />
                </form>
                {this.state.isPopupOnScreen ? (
                    <Popup>
                        {this.state.isRequest ? (
                            <Spinner />
                        ) : (
                            <Message
                                className={this.state.isSuccess}
                                onClose={this.onOkClicked}>
                                {this.state.messages.forEach(element => (
                                    <div>{element}</div>
                                ))}
                            </Message>
                        )}
                    </Popup>
                ) : null}
            </div>
        );
    }
}

export default SendMailForm;
