import React from 'react';
import axios from 'axios';
import classes from './Button.scss';

class Button extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <button
                className={classes.myButton}
                onClick={this.props.onClick}
                type="button"
                disabled={this.props.disabled}>
                {this.props.children}
            </button>
        );
    }
}

export default Button;
