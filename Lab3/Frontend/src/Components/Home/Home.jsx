import React from 'react';
import classes from './Home.scss';
import NoteList from '../NotesComponent/NoteList';
import startFetchMyQuery from '../../HasuraAPI/HasuraRequests';
import Popup from '../Popup/Popup';
import Spinner from '../Popup/Spinner';
import Message from '../Popup/Message';

class Home extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            autokey: 0,
            Notes: [],
            isLoading: true,
            lim: 5,
            errorMessage: '',
        };
    }

    componentDidMount = () => {
        if (!this.props.data) {
            this.loadNotes();
        }
    };

    componentDidUpdate = () => {
        let Notes = this.props.data?.ListName;
        if (Notes) this.setState({ Notes });
    };

    loadNotes = () => {
        const Notes = [];
        this.setState({ isLoading: true });
        startFetchMyQuery('selectListName', {}, this.props.authState)
            .then(res => {
                if (res[0]?.message) {
                    this.exceptionHandling(res[0]);
                    return;
                }
                res?.ListName.map(element => Notes.push(element));
                this.setState({ Notes, isLoading: false });
            })
            .catch(this.exceptionHandling);
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
        const oldList = Notes[index];
        this.props.skipSub();
        Notes.splice(index, 1);
        this.setState({
            Notes: [...Notes],
        });
        if (element.ListName)
            startFetchMyQuery(
                'deleteList',
                { Id: element.Id },
                this.props.authState,
            )
                .then(res => {
                    if (res[0]?.message) {
                        this.exceptionHandling(res[0]);
                        return;
                    }
                })
                .catch(() => {
                    Notes.splice(index, 0, oldList);
                    this.setState({
                        Notes: [...Notes],
                    });
                    this.exceptionHandling();
                });
    };

    updateNoteTitle = (ListId, newTitle, isNewNote) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        const oldList = Notes[index].ListName;
        Notes[index].ListName = newTitle;
        this.setState({ Notes: [...Notes] });
        this.props.skipSub();
        if (isNewNote) {
            this.setState({ isLoading: true });
            startFetchMyQuery(
                'addList',
                { ListName: newTitle },
                this.props.authState,
            )
                .then(res => {
                    this.setState({ isLoading: false });
                    if (res[0]?.message) {
                        this.exceptionHandling(res[0]);
                        return;
                    }
                    Notes[index].Id = res.insert_ListName.returning[0].Id;
                    this.setState({ Notes });
                })
                .catch(() => {
                    Notes.pop();
                    this.setState({ Notes: [...Notes], isLoading: false });
                    this.exceptionHandling();
                });
            return;
        }
        startFetchMyQuery(
            'changeListName',
            {
                Id: Notes[index].Id,
                ListName: newTitle,
            },
            this.props.authState,
        )
            .then(res => {
                if (res[0]?.message) {
                    this.exceptionHandling(res[0]);
                    return;
                }
            })
            .catch(() => {
                Notes[index].ListName = oldList;
                this.exceptionHandling();
            });
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
        const oldTask = Notes[index].Tasks[taskIndex];
        this.props.skipSub();
        if (Notes[index].Tasks[taskIndex].TaskName)
            startFetchMyQuery(
                'deleteLine',
                {
                    Id: Notes[index].Tasks[taskIndex].Id,
                },
                this.props.authState,
            )
                .then(res => {
                    if (res[0]?.message) {
                        this.exceptionHandling(res[0]);
                        return;
                    }
                })
                .catch(() => {
                    Notes[index].Tasks.splice(taskIndex, 0, oldTask);
                    this.exceptionHandling();
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
        const oldTask = Notes[index].Tasks[taskIndex].TaskName;
        Notes[index].Tasks[taskIndex] = {
            Id: Notes[index].Tasks[taskIndex].Id,
            TaskName: newTaskName,
            Checked: Notes[index].Tasks[taskIndex].Checked,
        };
        this.setState({ Notes: [...Notes] });
        this.props.skipSub();
        if (isNewTask) {
            this.setState({ isLoading: true });
            startFetchMyQuery(
                'addLine',
                {
                    IdList: Notes[index].Id,
                    TaskName: newTaskName,
                },
                this.props.authState,
            )
                .then(res => {
                    this.setState({ isLoading: false });
                    if (res[0]?.message) {
                        this.exceptionHandling(res[0]);
                        return;
                    }
                    Notes[index].Tasks[taskIndex] = {
                        Id: res.insert_Tasks.returning[0].Id,
                        TaskName: newTaskName,
                        Checked: false,
                    };
                    this.setState({ Notes: [...Notes] });
                })
                .catch(() => {
                    this.setState({ isLoading: false });
                    Notes[index].Tasks.pop();
                    this.exceptionHandling();
                });
            return;
        }
        startFetchMyQuery(
            'changeLine',
            {
                Id: Notes[index].Tasks[taskIndex].Id,
                TaskName: newTaskName,
            },
            this.props.authState,
        )
            .then(res => {
                if (res[0]?.message) {
                    this.exceptionHandling(res[0]);
                    return;
                }
            })
            .catch(() => {
                Notes[index].Tasks[taskIndex].TaskName = oldTask;
                this.exceptionHandling();
            });
    };

    changeCheckBox = (ListId, TaskId) => {
        const { Notes } = this.state;
        let index = Notes.findIndex(({ Id }) => Id === ListId);
        let taskIndex = Notes[index].Tasks.findIndex(({ Id }) => Id === TaskId);
        const oldTask = Notes[index].Tasks[taskIndex];
        oldTask.Checked = !oldTask.Checked;
        this.setState({ Notes: [...Notes] });
        this.props.skipSub();
        startFetchMyQuery(
            'changeCheckBox',
            {
                Id: Notes[index].Tasks[taskIndex].Id,
                Checked: oldTask.Checked,
            },
            this.props.authState,
        )
            .then(res => {
                if (res[0]?.message) {
                    this.exceptionHandling(res[0]);
                    return;
                }
            })
            .catch(() => {
                oldTask.Checked = !oldTask.Checked;
                this.exceptionHandling();
            });
    };

    exceptionHandling = errors => {
        this.setState({
            errorMessage: errors?.message ?? 'Something went wrong...',
        });
        return;
    };

    onOkClicked = () => {
        this.setState({ errorMessage: '' });
    };

    render() {
        const { Notes, isLoading, lim, errorMessage } = this.state;
        return (
            <div>
                <main>
                    {Notes.map(element => (
                        <NoteList
                            Id={element.Id}
                            key={element.ListName + element.Id}
                            Tasks={element.Tasks}
                            value={element.ListName}
                            deleteNote={() => this.deleteNote(element)}
                            updateNoteTitle={(newTitle, isNewNote) =>
                                this.updateNoteTitle(
                                    element.Id,
                                    newTitle,
                                    isNewNote,
                                )
                            }
                            addTask={() => this.addTask(element)}
                            deleteTask={this.deleteTask}
                            updateTask={this.updateTask}
                            changeCheckBox={this.changeCheckBox}
                            lim={lim}
                        />
                    ))}
                    {isLoading ? (
                        <Popup>
                            <Spinner />
                        </Popup>
                    ) : null}
                </main>
                {errorMessage ? (
                    <Popup>
                        <Message onClose={this.onOkClicked}>
                            {errorMessage}
                        </Message>
                    </Popup>
                ) : null}
            </div>
        );
    }
}

export default Home;
