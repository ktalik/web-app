import React, {useEffect, useRef, useState} from "react";
import '../styles/Contacts.css';
import axios from "axios";
import {BASE_URL} from "../Constants";
import {addPlusToPhoneNumber, getConfig, getObjLength, preparePhoneNumber, removeWhitespaces} from "../Helpers";
import SearchBar from "./SearchBar";
import {Button, CircularProgress, IconButton, InputAdornment, ListItem, TextField} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import DialpadIcon from '@material-ui/icons/Dialpad';
import Contact from "./Contact";
import ContactClass from "../ContactClass";
import {isMobileOnly} from "react-device-detect";
import {useHistory} from "react-router-dom";

function Contacts(props) {

    const [keyword, setKeyword] = useState("");
    const [contacts, setContacts] = useState({});
    const [isLoading, setLoading] = useState(false);
    const [isVerifying, setVerifying] = useState(false);
    const [isPhoneNumberFormVisible, setPhoneNumberFormVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("")

    let cancelTokenSourceRef = useRef();
    let verifyPhoneNumberCancelTokenSourceRef = useRef();

    const history = useHistory();

    useEffect(() => {
        const handleKey = (event) => {
            if (event.keyCode === 27) { // Escape
                props.onHide();
            }
        }

        document.addEventListener('keydown', handleKey);

        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        verifyPhoneNumberCancelTokenSourceRef.current = axios.CancelToken.source();

        findContacts();

        return () => {
            document.removeEventListener('keydown', handleKey);
            cancelTokenSourceRef.current.cancel();
            verifyPhoneNumberCancelTokenSourceRef.current.cancel();
        }
    }, []);

    let timeout = useRef();

    useEffect(() => {
        // Generate a token
        cancelTokenSourceRef.current = axios.CancelToken.source();

        if (keyword?.length > 0) {
            setLoading(true);

            timeout.current = setTimeout(function () {
                findPersons();
                findContacts();
            }, 500);
        }

        return () => {
            cancelTokenSourceRef.current.cancel();
            clearTimeout(timeout.current);
            setLoading(false);
        }
    }, [keyword]);

    const findContacts = () => {
        axios.get(`${BASE_URL}contacts/`, getConfig({
            search: keyword?.trim()
        }, cancelTokenSourceRef.current.token))
            .then((response) => {
                console.log("Contacts list", response.data);

                const preparedContacts = {};
                response.data.results.forEach((contact, contactIndex) => {
                    preparedContacts[contactIndex] = new ContactClass(contact);
                });

                setContacts(preparedContacts);

                setLoading(false);

            })
            .catch((error) => {
                console.log(error);
                window.displayError(error);
                setLoading(false);
            });
    }

    const findPersons = () => {

    }

    const verifyPhoneNumber = (data, waId) => {
        setVerifying(true);

        axios.post( `${BASE_URL}contacts/verify/`, {
            blocking: "wait",
            contacts: [addPlusToPhoneNumber(waId)],
            force_check: true
        }, getConfig(undefined, verifyPhoneNumberCancelTokenSourceRef.current.token))
            .then((response) => {
                console.log("Verify", response.data);

                if (response.data.contacts && response.data.contacts.length > 0 && response.data.contacts[0].status === "valid") {
                    history.push({
                        pathname: `/main/chat/${waId}`,
                        person: {
                            name: data?.name,
                            initials: data?.initials,
                            avatar: data?.avatar,
                            waId: waId
                        }
                    });

                    // Hide contacts on mobile
                    if (isMobileOnly) {
                        props.onHide();
                    }

                } else {
                    window.displayCustomError("There is no WhatsApp account connected to this phone number.");
                }

                setVerifying(false);

            })
            .catch((error) => {
                console.log(error);
                window.displayError(error);

                setVerifying(false);
            });
    }

    const startChatWithPhoneNumber = () => {
        verifyPhoneNumber(undefined, preparePhoneNumber(phoneNumber));
    }

    return (
        <div className="contacts">
            <div className="contacts__header">
                <IconButton onClick={props.onHide}>
                    <ArrowBack />
                </IconButton>

                <h3>New chat</h3>
            </div>

            <div className="contacts__startByPhoneNumberWrapper">
                <div className="contacts__startByPhoneNumber" onClick={() => setPhoneNumberFormVisible(prevState => !prevState)}>
                    <ListItem button>
                        <div className="contacts__startByPhoneNumber__inner">
                            <DialpadIcon />
                            <span>Start a chat with a phone number</span>
                        </div>
                    </ListItem>
                </div>

                {isPhoneNumberFormVisible &&
                <div className="contacts__startByPhoneNumberWrapper__formWrapper">
                    <TextField
                        label="Phone number"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">+</InputAdornment>,
                        }}
                        onChange={event => setPhoneNumber(event.target.value)} />
                    <Button color="primary" onClick={startChatWithPhoneNumber}>Start</Button>
                </div>
                }
            </div>

            <SearchBar
                placeholder="Search for contacts"
                onChange={setKeyword}
                isLoading={isLoading} />

            <div className="contacts__body">
                {keyword?.length === 0 &&
                <span className="contacts__body__hint">Enter a keyword to start searching for contacts</span>
                }

                {keyword?.trim()?.length > 0 &&
                <h3>Contacts</h3>
                }

                { Object.entries(contacts).map((contact, index) =>
                    <Contact
                        key={index}
                        data={contact[1]}
                        verifyPhoneNumber={verifyPhoneNumber}
                        onHide={props.onHide} />
                )}

                {isVerifying &&
                <div className="contacts__body__loading">
                    <CircularProgress color="inherit" />
                </div>
                }

                {(keyword?.length > 0 && getObjLength(contacts) === 0 && !isLoading) &&
                <span className="contacts__body__hint">No contacts found for <span
                    className="searchOccurrence">{keyword}</span></span>
                }
            </div>
        </div>
    )
}

export default Contacts;