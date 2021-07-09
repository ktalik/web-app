import React, {useEffect, useRef, useState} from "react";
import {generateCancelToken, retrieveBulkMessageElementsCall} from "../../api/ApiCalls";
import '../../styles/Notifications.css';
import PubSub from "pubsub-js";
import {EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT} from "../../Constants";
import FailedBulkMessageNotification from "./Notifications/FailedBulkMessageNotification";
import BulkMessageTaskElementClass from "../../BulkMessageTaskElementClass";

function Notifications(props) {

    const [bulkMessageElements, setBulkMessageElements] = useState({});
    let cancelTokenSourceRef = useRef();

    useEffect(() => {
        cancelTokenSourceRef.current = generateCancelToken();
        retrieveBulkMessageElements();

        const onBulkMessageTaskElement = function (msg, data) {
            if (data.status) {
                // Means a bulk message task element has failed, so we refresh the data
                retrieveBulkMessageElements();
            }
        }

        const bulkMessageTaskElementEventToken = PubSub.subscribe(EVENT_TOPIC_BULK_MESSAGE_TASK_ELEMENT, onBulkMessageTaskElement);

        return () => {
            cancelTokenSourceRef.current.cancel();
            PubSub.unsubscribe(bulkMessageTaskElementEventToken);
        }
    }, []);

    const retrieveBulkMessageElements = () => {
        retrieveBulkMessageElementsCall(cancelTokenSourceRef.current.token,
            (response) => {
                const preparedBulkMessageTaskElements = {};
                response.data.results.forEach((taskElement) => {
                    const prepared = new BulkMessageTaskElementClass(taskElement);
                    preparedBulkMessageTaskElements[prepared.id] = prepared;
                });

                setBulkMessageElements(preparedBulkMessageTaskElements);

                setBulkMessageElements(response.data.results);
            }, (error) => {

            });
    }

    return (
        <div className="notificationsWrapper">
            <div className="notifications">

                <div className="notifications__header">
                    <h3>Notifications</h3>
                </div>

                <div className="notifications__body">
                    {Object.entries(bulkMessageElements).map((notification) =>
                        <FailedBulkMessageNotification key={notification[1].id} data={notification[1]} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default Notifications;