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
            Tasks: this.props.Tasks,
            lim: this.props.lim,
            titleName: this.props.value,
            lastName: this.props.value,
        };
    }

    componentDidUpdate = () => {
        let Tasks = this.props.Tasks;
        this.setState({ Tasks });
    };

    render() {
        const { Tasks, lim, Id } = this.state;
        let { lastName, titleName } = this.state;
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
                        onBlur={() => {
                            let isNewNote = false;
                            if (!lastName) isNewNote = true;
                            if (!titleName) {
                                if (!lastName) {
                                    this.props.deleteNote();
                                    return;
                                }
                                titleName = lastName;
                                this.setState({
                                    titleName,
                                    lastName,
                                });
                                return;
                            }
                            lastName = titleName;
                            this.props.updateNoteTitle(
                                Id,
                                titleName,
                                isNewNote,
                            );

                            this.setState({
                                titleName,
                                lastName,
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
