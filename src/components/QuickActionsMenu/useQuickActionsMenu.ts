import { useMemo } from 'react';
import { QuickActionType } from '../QuickActionItem/QuickActionType';
import {
	COMMAND_ASSIGN,
	COMMAND_ASSIGN_ALIAS,
	COMMAND_SAVED_RESPONSE,
	COMMAND_SAVED_RESPONSE_ALIAS,
	COMMAND_SEARCH,
	COMMAND_SEARCH_ALIAS,
	COMMAND_TEMPLATE,
	COMMAND_TEMPLATE_ALIAS,
} from '@src/Constants';
import { sortTemplateComponents } from '@src/helpers/TemplateMessageHelper';
import { useAppSelector } from '@src/store/hooks';

export type Props = {
	input: string;
	isExpired: boolean;
};

const useQuickActionsMenu = ({ input, isExpired }: Props) => {
	const savedResponses = useAppSelector((state) => state.savedResponses.value);
	const templates = useAppSelector((state) => state.templates.value);
	const users = useAppSelector((state) => state.users.value);

	const generateCommandString = (item: QuickActionType) => {
		let commandString = item.command;
		if (item.parameters && item.parameters?.length > 0) {
			commandString = commandString + ' ' + item.parameters.join(' ');
		}
		return commandString;
	};

	const data = useMemo(() => {
		const items: QuickActionType[] = [
			...(!isExpired
				? [
						{
							command: COMMAND_SAVED_RESPONSE,
							isStatic: true,
							parameterHint: '<id>',
							description: [
								'Send a saved response',
								'Alias: ' + COMMAND_SAVED_RESPONSE_ALIAS,
							].join('\n'),
						},
				  ]
				: []),
			{
				command: COMMAND_TEMPLATE,
				isStatic: true,
				parameterHint: '<name>',
				description: [
					'Send a template message',
					'Alias: ' + COMMAND_TEMPLATE_ALIAS,
				].join('\n'),
			},
			{
				command: COMMAND_ASSIGN,
				isStatic: true,
				parameterHint: '<name>',
				description: [
					'Assign this chat',
					'Alias: ' + COMMAND_ASSIGN_ALIAS,
				].join('\n'),
			},
			{
				command: COMMAND_SEARCH,
				isStatic: true,
				parameterHint: '<message>',
				description: [
					'Search for a message',
					'Alias: ' + COMMAND_SEARCH_ALIAS,
				].join('\n'),
			},
		];

		const inputArray = input?.split(' ').filter((e) => e);

		if (
			!isExpired &&
			(input.startsWith(COMMAND_SAVED_RESPONSE) ||
				input.startsWith(COMMAND_SAVED_RESPONSE_ALIAS + ' '))
		) {
			Object.values(savedResponses).forEach((savedResponse: any) => {
				items.push({
					command: COMMAND_SAVED_RESPONSE,
					isStatic: true,
					parameters: [savedResponse.id?.toString() ?? 'undefined'],
					description: savedResponse.text,
					runCommand: true,
				});
			});
		}

		if (
			input.startsWith(COMMAND_TEMPLATE) ||
			input.startsWith(COMMAND_TEMPLATE_ALIAS + ' ')
		) {
			Object.values(templates).forEach((template: any) => {
				const descriptionArray = sortTemplateComponents(
					template.components
				).map(
					(comp: any) =>
						comp.type?.toLowerCase() +
						': ' +
						(comp.text ?? comp.format ?? JSON.stringify(comp.buttons))
				);

				items.push({
					command: COMMAND_TEMPLATE,
					isStatic: true,
					parameters: [template.name?.toLowerCase()],
					description: descriptionArray.join('\n'),
					runCommand: true,
				});
			});
		}

		if (
			input.startsWith(COMMAND_ASSIGN) ||
			input.startsWith(COMMAND_ASSIGN_ALIAS + ' ')
		) {
			Object.values(users).forEach((user: any) => {
				items.push({
					command: COMMAND_ASSIGN,
					isStatic: true,
					parameters: [user.username],
					description: [
						'Assign this chat to ' + user.username,
						'User role: ' + user.role,
					].join('\n'),
					runCommand: true,
				});
			});
		}

		if (
			input.startsWith(COMMAND_SEARCH) ||
			input.startsWith(COMMAND_SEARCH_ALIAS + ' ')
		) {
			const searchKeyword = inputArray
				.filter((item, index) => index !== 0)
				.join(' ');
			if (searchKeyword) {
				// Display search option with input key
				items.push({
					command: COMMAND_SEARCH,
					isStatic: true,
					parameters: searchKeyword.split(' '),
					description: 'Search for a message',
					runCommand: true,
				});
			}
		}

		Object.values(templates).forEach((template: any) => {
			items.push({
				command: '/' + template.name?.toLowerCase(),
				isStatic: false,
				parameters: [],
				description: 'Send this template',
				runCommand: true,
			});
		});

		return items.filter((item) => {
			// Check if every word matches
			let include = true;
			for (let i = 0; i < inputArray.length; i++) {
				if (i === 0) {
					if (!item.command.includes(inputArray[i])) {
						include = false;
						break;
					}
				} else {
					if (!item.parameters?.[i - 1]?.includes(inputArray[i])) {
						include = false;
						break;
					}
				}
			}

			return include || item.command.includes(input.substring(1).trim());
		});
	}, [input, isExpired, savedResponses, templates, users]);

	return { data, generateCommandString };
};

export default useQuickActionsMenu;
