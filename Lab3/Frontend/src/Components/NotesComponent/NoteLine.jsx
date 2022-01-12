import React from 'react';
import classes from './NoteLine.scss';
import Button from './../Button/Button';
import { ImCheckboxUnchecked, ImCheckmark } from 'react-icons/im';

class NoteLine extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            Id: this.props.Id,
            lastName: this.props.value,
            isTaskDone: this.props.isChecked,
            currentName: this.props.value,
        };
    }

    componentDidUpdate = () => {
        let isTaskDone = this.props.isChecked;
        this.setState({ isTaskDone });
    };

    render() {
        const { isTaskDone } = this.state;
        let { currentName } = this.state;
        return (
            <div className={classes.container}>
                <Button onClick={this.props.deleteTask}> &#10006; </Button>
                <label onClick={event => event.preventDefault()}>
                    {isTaskDone ? (
                        <ImCheckmark onClick={this.props.changeCheckBox} />
                    ) : (
                        <ImCheckboxUnchecked
                            onClick={this.props.changeCheckBox}
                        />
                    )}
                    <input
                        className={
                            isTaskDone ? classes.isNotDone : classes.isDone
                        }
                        onBlur={() =>
                            this.props.updateString(
                                this.props.deleteTask,
                                this.props.updateTask,
                                this.state,
                            )
                        }
                        onChange={event => {
                            currentName = event.target.value;
                            this.setState({ currentName });
                        }}
                        value={currentName}
                        autoFocus={!currentName}
                        maxLength="30"
                    />
                </label>
            </div>
        );
    }
}

export default NoteLine;
