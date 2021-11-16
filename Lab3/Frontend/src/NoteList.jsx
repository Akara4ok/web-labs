import React from 'react';
import axios from 'axios';
import classes from './NoteList.scss';
import NoteLine from 'NoteLine';
import Button from './Button';
import { TiPlus } from 'react-icons/Ti';
import startFetchMyQuery from './HasuraRequests';

class NoteList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            Id: this.props.Id,
            Lines: this.props.Tasks,
            isOldTask: this.props.isOldTask,
            isOldLine: [],
            lim: this.props.lim,
            titleName: this.props.value,
            lastValue: this.props.value,
        };
        this.loadLines();
    }

    componentDidUpdate = () => {
        if (this.props.Tasks) {
            let Lines = this.props.Tasks;
            console.log(Lines);
            this.setState({ Lines });
        }
    };

    loadLines = () => {
        const { Lines, isOldLine, Id, titleName } = this.state;
        let { count, lastValue } = this.state;
        //mutnoe deystvie
        Lines.map(element => isOldLine.push(true));
        count = Lines.length;
        this.setState({ Lines, isOldLine, count, lastValue });
    };

    addLine = () => {
        let { Lines, isOldLine } = this.state;
        Lines.push(this.props.element);
        isOldLine.push(false);
        this.props.addLine();
    };

    deleteLine = (event, element) => {
        let { Lines, isOldLine } = this.state;
        let index = Lines.indexOf(element);
        isOldLine.splice(index, 1);
        this.props.deleteLine(this.props.element, index);
    };

    updateLine = (element, newLine, isNewLine) => {
        let { Lines, isOldLine } = this.state;
        let index = Lines.indexOf(element);
        isOldLine[index] = true;
        this.props.updateLine(this.props.element, index, newLine, isNewLine);
    };

    changeCheckBox = element => {
        let { Lines } = this.state;
        let index = Lines.indexOf(element);
        this.props.changeCheckBox(this.props.element, index);
    };

    render() {
        const { Lines, lim, isOldLine, Id } = this.state;
        let { lastValue, titleName } = this.state;
        return (
            <div>
                <div className={classes.note}>
                    <div className={classes.line}>
                        <Button onClick={this.props.onDelete}>
                            {' '}
                            &#10006;{' '}
                        </Button>
                    </div>
                    <input
                        className={classes.noteHead}
                        onBlur={event => {
                            let isNewNote = false;
                            if (!lastValue) isNewNote = true;
                            if (!titleName) {
                                if (!lastValue) {
                                    this.props.onDelete();
                                    return;
                                }
                                titleName = lastValue;
                                this.setState({
                                    titleName,
                                    lastValue,
                                });
                                return;
                            }
                            lastValue = titleName;
                            this.props.updateNoteTitle(
                                this.props.element,
                                titleName,
                                isNewNote,
                            );

                            this.setState({
                                titleName,
                                lastValue,
                            });
                        }}
                        onChange={event => {
                            titleName = event.target.value;
                            this.setState({ titleName });
                        }}
                        value={titleName}
                        autoFocus={!this.props.isOldTask}
                        maxLength="10"
                    />
                    {Lines.map(element => (
                        <NoteLine
                            key={element.TaskName + element.Id}
                            isChecked={element.Checked}
                            Id={element.Id}
                            isOldLine={isOldLine[Lines.indexOf(element)]}
                            onDeleteLine={event =>
                                this.deleteLine(event, element)
                            }
                            updateLine={this.updateLine}
                            changeCheckBox={this.changeCheckBox}
                            element={element}
                            value={element.TaskName}
                        />
                    ))}
                    {Lines.length !== lim ? (
                        <Button
                            onClick={this.addLine}
                            className={classes.pushButton}>
                            {' '}
                            <TiPlus />{' '}
                        </Button>
                    ) : null}
                </div>
            </div>
        );
    }
}

export default NoteList;
