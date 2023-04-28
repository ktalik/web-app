// @ts-nocheck
import React from 'react';
import { Checkbox, ListItemButton, Tooltip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import Moment from 'react-moment';
import {
	extractAvatarFromContactProviderData,
	generateInitialsHelper,
} from '@src/helpers/Helpers';
import { handleDragOver } from '@src/helpers/FileHelper';
import {
	CALENDAR_SHORT,
	CHAT_LIST_TAB_CASE_ALL,
	CHAT_LIST_TAB_CASE_GROUP,
	CHAT_LIST_TAB_CASE_ME,
} from '@src/Constants';
import ChatMessageShortContent from '../Main/Chat/ChatMessage/ChatMessageShortContent';
import { generateAvatarColor } from '@src/helpers/AvatarHelper';
import { addPlus } from '@src/helpers/PhoneNumberHelper';
import { useTranslation } from 'react-i18next';
import PrintMessage from '../PrintMessage';
import CustomAvatar from '@src/components/CustomAvatar';
import SellIcon from '@mui/icons-material/Sell';
import useChatListItem from '@src/components/ChatListItem/useChatListItem';
import styles from './ChatListItem.module.css';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const ChatListItem = (props) => {
	const { t } = useTranslation();

	const {
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
	} = useChatListItem({ props });

	const newMessages = props.newMessages[data.waId]?.newMessages;

	return (
		<ListItemButton onClick={handleClick} className={styles.listItem}>
			<div
				id={data.waId}
				className={cx({
					wrapper: true,
					active: waId === data.waId,
					expired: isExpired,
					almostExpired: remainingSeconds < 8 * 60 * 60,
					selected: props.isSelectionModeEnabled && isSelected,
				})}
				onDrop={handleDroppedFiles}
				onDragOver={handleDragOver}
			>
				<div className={styles.item}>
					{props.isSelectionModeEnabled && (
						<Checkbox
							className={styles.selection}
							checked={isSelected}
							color="primary"
							disabled={isDisabled}
						/>
					)}

					<div className={styles.avatarWrapper}>
						<CustomAvatar
							className={styles.mainAvatar}
							src={extractAvatarFromContactProviderData(
								props.contactProvidersData[data.waId]
							)}
							style={
								isExpired
									? {}
									: {
											backgroundColor: generateAvatarColor(data.name),
									  }
							}
						>
							{data.initials}
						</CustomAvatar>

						{newMessages > 0 && (
							<div className={styles.newMessagesBadge}>
								{newMessages > 99 ? '99+' : newMessages}
							</div>
						)}
					</div>

					<div className={styles.info}>
						<div className={styles.nameWrapper}>
							<h2>
								{props.keyword && props.keyword.trim().length > 0 ? (
									<PrintMessage
										message={data.name}
										highlightText={props.keyword}
									/>
								) : (
									<PrintMessage
										message={
											props.contactProvidersData[data.waId]?.[0]?.name ??
											data.name
										}
									/>
								)}
							</h2>

							{data.assignedToUser &&
								(props.tabCase === CHAT_LIST_TAB_CASE_ALL ||
									props.tabCase === CHAT_LIST_TAB_CASE_GROUP) && (
									<Tooltip
										placement="top"
										title={data.generateAssignmentInformation()}
									>
										<div className={styles.assigneeChip}>
											<CustomAvatar
												className={styles.assigneeAvatar}
												style={{
													backgroundColor: generateAvatarColor(
														data.getAssignedUserUsername()
													),
												}}
											>
												{generateInitialsHelper(
													data.generateAssignedToInitials()
												)}
											</CustomAvatar>
											<span>{data.getAssignedUserUsername()}</span>
										</div>
									</Tooltip>
								)}

							{data.assignedGroup &&
								((props.tabCase === CHAT_LIST_TAB_CASE_ALL &&
									!data.assignedToUser) ||
									props.tabCase === CHAT_LIST_TAB_CASE_ME ||
									(props.tabCase === CHAT_LIST_TAB_CASE_GROUP &&
										!data.assignedToUser)) && (
									<Tooltip
										placement="top"
										title={data.generateAssignmentInformation()}
									>
										<div className={styles.assigneeChip}>
											<div className={styles.assignedGroupIconWrapper}>
												<GroupIcon />
											</div>
											<span>{data.assignedGroup?.name}</span>
										</div>
									</Tooltip>
								)}

							{!isExpired && (
								<Tooltip
									title={t('This chat will become inactive in %s', timeLeft)}
									placement="top"
								>
									<div className={styles.timeLeft}>
										<div className={styles.timeLeftIconWrapper}>
											<HourglassBottomIcon />
										</div>
										<span>{timeLeft}</span>
									</div>
								</Tooltip>
							)}
						</div>

						<div className={styles.lastMessageWrapper}>
							<div className={styles.lastMessage}>
								<ChatMessageShortContent
									type={data.lastMessageType}
									template={data.lastMessage?.template}
									buttonText={data.lastMessageButtonText}
									interactiveButtonText={data.interactiveButtonText}
									text={data.lastMessageBody}
									caption={data.lastMessageCaption}
									isLastMessageFromUs={data.isLastMessageFromUs}
								/>
							</div>

							<div className={styles.dateTagWrapper}>
								{data.tags?.length > 0 && (
									<div className={styles.tags}>
										<Tooltip title={generateTagNames()}>
											<div>
												{data.tags.slice(0, 3).map((tagItem, tagIndex) => (
													<SellIcon
														key={tagIndex}
														className={styles.tagIcon}
														style={{
															fill: tagItem.web_inbox_color,
														}}
													/>
												))}
											</div>
										</Tooltip>
									</div>
								)}

								{data.lastMessageTimestamp && (
									<Moment
										className={styles.lastMessageDate}
										date={data.lastMessageTimestamp}
										calendar={CALENDAR_SHORT}
										unix
									/>
								)}
							</div>
						</div>
					</div>
				</div>

				<span className={styles.waId}>{addPlus(data.waId)}</span>

				{hasFailedMessages() && (
					<div className={styles.failedMessagesIndicator}>
						<Tooltip title={t('This chat has failed messages!')}>
							<WarningIcon className="error" />
						</Tooltip>
					</div>
				)}
			</div>
		</ListItemButton>
	);
};

export default ChatListItem;
