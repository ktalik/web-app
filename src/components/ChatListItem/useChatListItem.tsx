// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import moment from 'moment/moment';
import { getDroppedFiles } from '@src/helpers/FileHelper';
import PubSub from 'pubsub-js';
import { EVENT_TOPIC_DROPPED_FILES } from '@src/Constants';

const useChatListItem = ({ props }) => {
	const data = props.chatData;

	const [isSelected, setSelected] = useState(false);
	const [isExpired, setExpired] = useState(props.chatData.isExpired);
	const [timeLeft, setTimeLeft] = useState();
	const [remainingSeconds, setRemainingSeconds] = useState();
	const [isCheckedMissingContact, setCheckedMissingContact] = useState(false);

	const isDisabled = useMemo(() => {
		return isExpired && props.bulkSendPayload?.type !== 'template';
	}, [isExpired, props.bulkSendPayload]);

	const { waId } = useParams();

	const navigate = useNavigate();

	useEffect(() => {
		setSelected(props.selectedChats.includes(data.waId));
	}, [props.selectedChats]);

	const generateTagNames = () => {
		const generatedTagNames = [];
		data.tags?.forEach((tag) => {
			generatedTagNames.push(tag.name);
		});
		return generatedTagNames.join(', ');
	};

	useEffect(() => {
		if (
			!isCheckedMissingContact &&
			data.waId &&
			!props.contactProvidersData[data.waId]
		) {
			setCheckedMissingContact(true);
			props.retrieveContactData(data.waId);
		}
	}, [isCheckedMissingContact, props.contactProvidersData]);

	useEffect(() => {
		function calculateRemaining() {
			const momentDate = moment.unix(data.lastReceivedMessageTimestamp);
			momentDate.add(1, 'day');
			const curDate = moment(new Date());
			const hours = momentDate.diff(curDate, 'hours');
			const seconds = momentDate.diff(curDate, 'seconds');

			setRemainingSeconds(seconds);

			let suffix;

			if (hours > 0) {
				suffix = 'h';
				setTimeLeft(hours + suffix);
			} else {
				const minutes = momentDate.diff(curDate, 'minutes');
				if (minutes > 1) {
					suffix = 'm';
					setTimeLeft(minutes + suffix);
				} else {
					if (seconds > 1) {
						suffix = 'm';
						setTimeLeft(minutes + suffix);
					} else {
						// Expired
						setExpired(true);
					}
				}
			}
		}

		setExpired(data.isExpired);

		// Initial
		calculateRemaining();

		let intervalId;
		if (!isExpired) {
			intervalId = setInterval(() => {
				calculateRemaining();
			}, 30000);
		}

		return () => {
			clearInterval(intervalId);
		};
	}, [isExpired, data.isExpired, data.lastMessageTimestamp]);

	const handleDroppedFiles = (event) => {
		if (isExpired) {
			event.preventDefault();
			return;
		}

		// Preparing dropped files
		const files = getDroppedFiles(event);

		// Switching to related chat
		navigate(`/main/chat/${data.waId}`);

		// Sending files via eventbus
		PubSub.publish(EVENT_TOPIC_DROPPED_FILES, files);
	};

	const handleClick = () => {
		if (props.isSelectionModeEnabled) {
			if (isDisabled) return;

			let newSelectedState = !isSelected;

			props.setSelectedChats((prevState) => {
				if (newSelectedState) {
					if (!prevState.includes(data.waId)) {
						prevState.push(data.waId);
					}
				} else {
					prevState = prevState.filter((arrayItem) => arrayItem !== data.waId);
				}

				return [...prevState];
			});
		} else {
			navigate(`/main/chat/${data.waId}`);
		}
	};

	const hasFailedMessages = () => {
		let result = false;
		props.pendingMessages.forEach((pendingMessage) => {
			if (
				pendingMessage.requestBody?.wa_id === data.waId &&
				pendingMessage.isFailed === true
			)
				result = true;
		});

		return result;
	};

	return {
		data,
		waId,
		isExpired,
		timeLeft,
		remainingSeconds,
		isSelected,
		handleClick,
		handleDroppedFiles,
		generateTagNames,
		isDisabled,
		hasFailedMessages,
	};
};

export default useChatListItem;