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
                res.ListName.map(element => Notes.push(element));
                isLoading = false;
                this.setState({ Notes, isLoading });
            });
        }
    };

    addNote = event => {
        const { Notes } = this.state;
        let { autokey } = this.state;
        let Id = autokey;
        autokey++;
        let ListName = '';
        let Tasks = [];
        Notes.push({ Id, ListName, Tasks });
        this.setState({ Notes: [...Notes], autokey });
    };

    deleteNote = (event, element) => {
        const { Notes } = this.state;
        let index = Notes.indexOf(element);
        console.log(index);
        this.props.skipSub();
        this.props.skipSub();
        if (element.ListName)
            startFetchMyQuery('deleteList', { Id: element.Id });
        Notes.splice(index, 1);
        this.setState({
            Notes: [...Notes],
        });
    };

    updateNoteTitle = (element, newTitle, isNewNote) => {
        const { Notes } = this.state;
        let index = Notes.indexOf(element);
        Notes[index].ListName = newTitle;
        this.setState({ Notes });
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

    addLine = element => {
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

    deleteLine = (ListId, LineId) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let lineIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === LineId);
        this.props.skipSub();
        if (Notes[index].Tasks[lineIndex].TaskName)
            startFetchMyQuery('deleteLine', {
                Id: Notes[index].Tasks[lineIndex].Id,
            });
        Notes[index].Tasks.splice(lineIndex, 1);
        this.setState({
            Notes: [...Notes],
        });
    };

    updateLine = (ListId, LineId, newLine, isNewLine) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let lineIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === LineId);
        //console.log("index: " + index + " lineIndex: " + lineIndex);
        console.log(newLine);
        Notes[index].Tasks[lineIndex] = {
            Id: Notes[index].Tasks[lineIndex].Id,
            TaskName: newLine,
            Checked: Notes[index].Tasks[lineIndex].Checked,
        };
        this.props.skipSub();
        this.setState({ Notes });
        if (isNewLine) {
            startFetchMyQuery('addLine', {
                IdList: Notes[index].Id,
                TaskName: newLine,
            }).then(res => {
                Notes[index].Tasks[lineIndex] = {
                    Id: res.insert_Tasks.returning[0].Id,
                    TaskName: newLine,
                    Checked: false,
                };
                this.setState({ Notes });
            });
            return;
        }
        startFetchMyQuery('changeLine', {
            Id: Notes[index].Tasks[lineIndex].Id,
            TaskName: newLine,
        });
        this.setState({ Notes });
    };

    changeCheckBox = (ListId, LineId) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let lineIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === LineId);
        Notes[index].Tasks[lineIndex].Checked =
            !Notes[index].Tasks[lineIndex].Checked;
        this.setState({ Notes: [...Notes] });
        this.props.skipSub();
        startFetchMyQuery('changeCheckBox', {
            Id: Notes[index].Tasks[lineIndex].Id,
            Checked: Notes[index].Tasks[lineIndex].Checked,
        });
    };

    render() {
        const { Notes, isLoading, lim } = this.state;
        return (
            <div>
                <header>
                    <h1>Notes</h1>
                    <button onClick={event => this.addNote(event)}>Add</button>
                </header>
                <main>
                    {!isLoading ? (
                        Notes.map(element => (
                            <NoteList
                                Id={element.Id}
                                key={element.ListName + element.Id}
                                Tasks={element.Tasks}
                                value={element.ListName}
                                onDelete={event =>
                                    this.deleteNote(event, element)
                                }
                                updateNoteTitle={this.updateNoteTitle}
                                addLine={event => this.addLine(element)}
                                deleteLine={this.deleteLine}
                                updateLine={this.updateLine}
                                changeCheckBox={this.changeCheckBox}
                                element={element}
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
