import React from 'react';
import axios from 'axios';
import classes from './Layout.scss';
import NoteList from './NotesComponent/NoteList';
import startFetchMyQuery from './../HasuraAPI/HasuraRequests';
import Popup from './Popup/Popup';
import Spinner from './Popup/Spinner';

class Layout extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            autokey: 0,
            Notes: [],
            isLoading: true,
            lim: 5,
        };
        this.loadNotes();
    }

    componentDidUpdate = () => {
        if (this.props.data) {
            let Notes = this.props.data.ListName;
            this.setState({ Notes });
        }
    };

    loadNotes = () => {
        const { Notes } = this.state;
        let { isLoading } = this.state;
        if (!this.props.data) {
            startFetchMyQuery('selectListName').then(res => {
                this.props.skipSub();
                res.ListName.map(element => Notes.push(element));
                isLoading = false;
                this.setState({ Notes, isLoading });
            });
        }
    };

    addNote = () => {
        const { Notes } = this.state;
        let { autokey } = this.state;
        let Id = autokey;
        autokey++;
        let ListName = '';
        let Tasks = [];
        Notes.push({ Id, ListName, Tasks });
        this.setState({ Notes: [...Notes], autokey });
    };

    deleteNote = element => {
        const { Notes } = this.state;
        let index = Notes.indexOf(element);
        console.log(index);
        this.props.skipSub();
        if (element.ListName)
            startFetchMyQuery('deleteList', { Id: element.Id });
        Notes.splice(index, 1);
        this.setState({
            Notes: [...Notes],
        });
    };

    updateNoteTitle = (ListId, newTitle, isNewNote) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        Notes[index].ListName = newTitle;
        this.props.skipSub();
        if (isNewNote) {
            startFetchMyQuery('addList', { ListName: newTitle }).then(res => {
                Notes[index].Id = res.insert_ListName.returning[0].Id;
                this.setState({ Notes });
            });
            return;
        }
        startFetchMyQuery('changeListName', {
            Id: Notes[index].Id,
            ListName: newTitle,
        });
        this.setState({ Notes });
    };

    addTask = element => {
        const { Notes } = this.state;
        let { autokey } = this.state;
        autokey++;
        let index = Notes.indexOf(element);
        Notes[index].Tasks.push({ Id: autokey, TaskName: '', Checked: false });
        this.setState({
            autokey,
            Notes: [...Notes],
        });
    };

    deleteTask = (ListId, TaskId) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let taskIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === TaskId);
        this.props.skipSub();
        if (Notes[index].Tasks[taskIndex].TaskName)
            startFetchMyQuery('deleteLine', {
                Id: Notes[index].Tasks[taskIndex].Id,
            });
        Notes[index].Tasks.splice(taskIndex, 1);
        this.setState({
            Notes: [...Notes],
        });
    };

    updateTask = (ListId, TaskId, newTaskName, isNewTask) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let taskIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === TaskId);
        Notes[index].Tasks[taskIndex] = {
            Id: Notes[index].Tasks[taskIndex].Id,
            TaskName: newTaskName,
            Checked: Notes[index].Tasks[taskIndex].Checked,
        };
        this.props.skipSub();
        this.setState({ Notes });
        if (isNewTask) {
            startFetchMyQuery('addLine', {
                IdList: Notes[index].Id,
                TaskName: newTaskName,
            }).then(res => {
                Notes[index].Tasks[taskIndex] = {
                    Id: res.insert_Tasks.returning[0].Id,
                    TaskName: newTaskName,
                    Checked: false,
                };
                this.setState({ Notes });
            });
            return;
        }
        startFetchMyQuery('changeLine', {
            Id: Notes[index].Tasks[taskIndex].Id,
            TaskName: newTaskName,
        });
        this.setState({ Notes });
    };

    changeCheckBox = (ListId, TaskId) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let taskIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === TaskId);
        Notes[index].Tasks[taskIndex].Checked =
            !Notes[index].Tasks[taskIndex].Checked;
        this.setState({ Notes: [...Notes] });
        this.props.skipSub();
        startFetchMyQuery('changeCheckBox', {
            Id: Notes[index].Tasks[taskIndex].Id,
            Checked: Notes[index].Tasks[taskIndex].Checked,
        });
    };

    render() {
        const { Notes, isLoading, lim } = this.state;
        return (
            <div>
                <header>
                    <h1>Notes</h1>
                    <button onClick={() => this.addNote()}>Add</button>
                </header>
                <main>
                    {!isLoading ? (
                        Notes.map(element => (
                            <NoteList
                                Id={element.Id}
                                key={element.ListName + element.Id}
                                Tasks={element.Tasks}
                                value={element.ListName}
                                deleteNote={() => this.deleteNote(element)}
                                updateNoteTitle={this.updateNoteTitle}
                                addTask={() => this.addTask(element)}
                                deleteTask={this.deleteTask}
                                updateTask={this.updateTask}
                                changeCheckBox={this.changeCheckBox}
                                lim={lim}
                            />
                        ))
                    ) : (
                        <Popup>
                            <Spinner />
                        </Popup>
                    )}
                </main>
            </div>
        );
    }
}

export default Layout;
