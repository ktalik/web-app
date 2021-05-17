import React, {useEffect, useState} from "react";
import {Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import axios from "axios";
import {BASE_URL} from "../Constants";
import {getConfig} from "../Helpers";
import '../styles/ChatTags.css';

function ChatTags(props) {

    const [isLoading, setLoading] = useState(true);
    const [chat, setChat] = useState();
    const [chatTags, setChatTags] = useState([]);
    const [allTags, setAllTags] = useState([]);

    useEffect(() => {
        retrieveChat();
    }, []);

    useEffect(() => {
        props.setChats(prevState => {
            prevState[props.waId].tags = chatTags;
            console.log(chatTags);
            return {...prevState};
        });
    }, [chatTags]);

    const close = () => {
        props.setOpen(false);
    }

    const onDeleteTag = (tag) => {
        deleteTag(tag);
    }

    const onClickTag = (tag) => {
        createTag(tag);
    }

    const retrieveChat = () => {
        axios.get( `${BASE_URL}chats/${props.waId}/`, getConfig())
            .then((response) => {
                console.log("Chat: ", response.data);

                setChat(response.data);
                setChatTags(response.data.tags);

                // Next
                listTags();
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const listTags = () => {
        axios.get( `${BASE_URL}tags/`, getConfig())
            .then((response) => {
                console.log("Tags: ", response.data);

                setAllTags(response.data.results);

                setLoading(false);
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const createTag = (tag) => {
        axios.post( `${BASE_URL}chat_tagging/`, {
            tag: tag.id,
            chat: props.waId
        }, getConfig())
            .then((response) => {
                console.log("Created tag: ", response.data);

                setChatTags(prevState => {
                    const nextState = prevState.filter((curTag) => {
                        return curTag.id !== tag.id;
                    });

                    tag.tagging_id = response.data.id;

                    nextState.push(tag);

                    return nextState;
                });
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    const deleteTag = (tag) => {
        axios.delete( `${BASE_URL}chat_tagging/${tag.tagging_id}`, getConfig())
            .then((response) => {
                console.log("Deleted tag: ", response.data);

                setChatTags(prevState => {
                    return prevState.filter((curTag) => {
                        return curTag.id !== tag.id;
                    });
                });
            })
            .catch((error) => {
                window.displayError(error);
            });
    }

    return (
        <Dialog open={props.open} onClose={close} className="chatTagsWrapper">
            <DialogTitle>Chat tags</DialogTitle>
            <DialogContent>
                <div className="mb-3">You can add or remove tags for this chat</div>

                {chatTags &&
                <div className="chatTags__tags current">
                    <h5>Current tags</h5>
                    <div>
                        {chatTags.map((tag) =>
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                onDelete={() => onDeleteTag(tag)} />
                        )}
                    </div>
                </div>
                }

                {allTags &&
                <div className="chatTags__tags mt-3">
                    <h5>All tags</h5>
                    <div>
                        {allTags.filter((tag) => {
                            if (chatTags) {
                                let found = false;
                                for (let i = 0; i < chatTags.length; i++) {
                                    const curTag = chatTags[i];
                                    if (curTag.id === tag.id) {
                                        found = true;
                                        break;
                                    }
                                }
                                if (!found) {
                                    return tag;
                                }
                            } else {
                                return tag;
                            }
                        }).map((tag) =>
                            <Chip
                                key={tag.id}
                                label={tag.name}
                                clickable
                                onClick={() => onClickTag(tag)} />
                        )}
                    </div>
                </div>
                }

            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="secondary">Close</Button>
                {/*<Button color="primary">Update</Button>*/}
            </DialogActions>

            {isLoading &&
            <div className="chatTagsWrapper__loading">
                <CircularProgress size={28} />
            </div>
            }

        </Dialog>
    )
}

export default ChatTags;