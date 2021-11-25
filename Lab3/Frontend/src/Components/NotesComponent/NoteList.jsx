import React from 'react';
import classes from './NoteList.scss';
import NoteLine from './NoteLine';
import Button from './../Button/Button';
import { TiPlus } from 'react-icons/ti';

class NoteList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            Id: this.props.Id,
            Tasks: this.props.Tasks,
            lim: this.props.lim,
            currentName: this.props.value,
            lastName: this.props.value,
        };
    }

    componentDidUpdate = () => {
        let Tasks = this.props.Tasks;
        this.setState({ Tasks });
    };

    updateString = (lastName, currentName, deleteItem, update, state) => {
        let isNewLine = !lastName;
        if (!currentName && !lastName) {
            deleteItem();
            return;
        }
        if (!currentName) {
            state.currentName = lastName;
            this.forceUpdate();
            return;
        }
        state.lastName = currentName;
        update(currentName, isNewLine);
    };

    render() {
        const { Tasks, lim, Id } = this.state;
        let { lastName, currentName } = this.state;
        return (
            <div>
                <div className={classes.note}>
                    <div className={classes.line}>
                        <Button onClick={this.props.deleteNote}>
                            {' '}
                            &#10006;{' '}
                        </Button>
                    </div>
                    <input
                        className={classes.noteHead}
                        onBlur={() =>
                            this.updateString(
                                lastName,
                                currentName,
                                this.props.deleteNote,
                                this.props.updateNoteTitle,
                                this.state,
                            )
                        }
                        onChange={event => {
                            currentName = event.target.value;
                            this.setState({ currentName });
                        }}
                        value={currentName}
                        autoFocus={!currentName}
                        maxLength="10"
                    />
                    {Tasks.map(element => (
                        <NoteLine
                            key={element.TaskName + element.Id}
                            isChecked={element.Checked}
                            Id={element.Id}
                            deleteTask={() =>
                                this.props.deleteTask(Id, element.Id)
                            }
                            updateTask={(newTaskName, isNewTask) =>
                                this.props.updateTask(
                                    Id,
                                    element.Id,
                                    newTaskName,
                                    isNewTask,
                                )
                            }
                            updateString={this.updateString}
                            changeCheckBox={() =>
                                this.props.changeCheckBox(Id, element.Id)
                            }
                            value={element.TaskName}
                        />
                    ))}
                    {Tasks.length !== lim ? (
                        <Button
                            onClick={this.props.addTask}
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
