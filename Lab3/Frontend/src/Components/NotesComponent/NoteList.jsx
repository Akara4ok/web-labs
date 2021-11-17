import React from 'react';
import classes from './NoteList.scss';
import NoteLine from './NoteLine';
import Button from './../Button/Button';
import { TiPlus } from 'react-icons/Ti';

class NoteList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            Id: this.props.Id,
            Lines: this.props.Tasks,
            lim: this.props.lim,
            titleName: this.props.value,
            lastValue: this.props.value,
        };
    }

    componentDidUpdate = () => {
        if (this.props.Tasks) {
            let Lines = this.props.Tasks;
            this.setState({ Lines });
        }
    };

    updateLine = (element, newLine, isNewLine) => {
        let { Lines } = this.state;
        let index = Lines.indexOf(element);
        this.props.updateLine(this.props.element, index, newLine, isNewLine);
    };

    /*changeCheckBox = element => {
        let { Lines } = this.state;
        let index = Lines.indexOf(element);
        this.props.changeCheckBox(this.props.element, index);
    };*/

    render() {
        const { Lines, lim, Id } = this.state;
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
                        autoFocus={!titleName}
                        maxLength="10"
                    />
                    {Lines.map(element => (
                        <NoteLine
                            key={element.TaskName + element.Id}
                            isChecked={element.Checked}
                            Id={element.Id}
                            onDeleteLine={event =>
                                this.props.deleteLine(Id, element.Id)
                            }
                            updateLine={this.updateLine}
                            changeCheckBox={this.props.changeCheckBox(
                                Id,
                                element.Id,
                            )}
                            element={element}
                            value={element.TaskName}
                        />
                    ))}
                    {Lines.length !== lim ? (
                        <Button
                            onClick={this.props.addLine}
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
