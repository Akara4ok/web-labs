import React from 'react';
import classes from './NoteLine.scss';
import Button from './../Button/Button';
import { ImCheckboxUnchecked, ImCheckmark } from 'react-icons/Im';

class NoteLine extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            Id: this.props.Id,
            lastValue: this.props.value,
            isTaskDone: this.props.isChecked,
            lineValue: this.props.value,
        };
    }

    componentDidUpdate = () => {
        if (this.props.isChecked !== undefined) {
            let isTaskDone = this.props.isChecked;
            this.setState({ isTaskDone });
        }
    };

    /*changeCheckBox = () => {
        let { isTaskDone } = this.state;
        this.props.changeCheckBox(this.props.element);
        this.setState({ isTaskDone: !isTaskDone });
    };*/

    render() {
        const { isTaskDone } = this.state;
        let { lastValue, lineValue } = this.state;
        return (
            <div className={classes.container}>
                <Button onClick={this.props.onDeleteLine}> &#10006; </Button>
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
                        onBlur={event => {
                            let isNewLine = false;
                            if (!lastValue) isNewLine = true;
                            if (!lineValue) {
                                if (!lastValue) {
                                    this.props.onDeleteLine();
                                    return;
                                }
                                lineValue = lastValue;
                                this.setState({
                                    lineValue,
                                    lastValue,
                                });
                                return;
                            }
                            lastValue = lineValue;
                            this.props.updateLine(
                                this.props.element,
                                lineValue,
                                isNewLine,
                            );
                            this.setState({
                                lineValue,
                                lastValue,
                            });
                        }}
                        onChange={event => {
                            lineValue = event.target.value;
                            this.setState({ lineValue });
                        }}
                        value={lineValue}
                        autoFocus={!lineValue}
                        maxLength="30"
                    />
                </label>
            </div>
        );
    }
}

export default NoteLine;
