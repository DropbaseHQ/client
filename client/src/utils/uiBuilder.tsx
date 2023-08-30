/* eslint-disable  */
import { useFormContext } from 'react-hook-form';
import {
	Box,
	FormLabel,
	FormControl,
	Button,
	NumberInput,
	NumberInputField,
	Select,
	Input as ChakraInput,
} from '@chakra-ui/react';
import get from 'lodash/get';
import { userInputAtom } from '@/features/app-builder/atoms/tableContextAtoms';
import { useParams } from 'react-router';
import { useMutation } from 'react-query';
import { axios } from '@/lib/axios';
import { useAtom, useSetAtom } from 'jotai';
import { selectedRowAtom } from '@/features/app-builder/atoms/tableContextAtoms';
import { runResultAtom } from '@/features/app-builder/atoms/tableContextAtoms';
import { useRunFunction } from '@/features/app-builder/hooks/useRunFunction';
const runTask = async ({
	pageId,
	userInput,
	row,
	action,
}: {
	pageId: string;
	userInput: any;
	row: any;
	action: any;
}) => {
	const { data } = await axios.post('/task/', {
		page_id: pageId,
		user_input: userInput,
		row,
		action,
		call_type: 'task',
	});
	return data;
};

export const useRunTask = () => {
	const setRunResult = useSetAtom(runResultAtom);
	return useMutation(runTask, {
		onSettled: (data, _error, _variables, _context) => {
			setRunResult(data);
		},
	});
};

const checkAllRulesPass = ({ formValues, rules }: any) => {
	if (!rules || rules?.length === 0) {
		return true;
	}
	const invalidRule = rules.find((r: any) => {
		const fieldValue = get(formValues, r.name);
		switch (r.operator) {
			case 'equals': {
				return r.value != fieldValue;
			}
			case 'gt': {
				return r.value >= fieldValue;
			}
			case 'gte': {
				return r.value > fieldValue;
			}
			case 'lt': {
				return r.value <= fieldValue;
			}
			case 'lte': {
				return r.value <= fieldValue;
			}
			case 'exists': {
				return !(r.name in formValues);
			}
			default:
				return false;
		}
	});
	return !invalidRule;
};

export const CustomInput = (props: any) => {
	const {
		name,
		type,
		options,
		display_rules: displayRules,
		on_change_rules: onChangeRules,
		// on_select: onSelect,
		// on_click: onClick,
		on_change: onChange,
	} = props;
	const { watch, register, getValues } = useFormContext();
	const setRunResult = useSetAtom(runResultAtom);

	const runTask = useRunFunction({
		onSuccess: (response: any) => {
			if (typeof response.result !== 'string') {
				response.result = JSON.stringify(response.result);
			}
			setRunResult(response);
		},
	});
	const [selectedRow] = useAtom(selectedRowAtom);
	const [userInput] = useAtom(userInputAtom);
	const { pageId } = useParams();
	watch();

	if (
		(displayRules &&
			checkAllRulesPass({
				formValues: getValues(),
				rules: displayRules,
			})) ||
		!displayRules
	) {
		if (type === 'select') {
			if (typeof options === 'string') {
				return null;
			}
			return (
				<Box>
					<FormControl>
						<FormLabel htmlFor={name}>{name}</FormLabel>
						<Select
							id={name}
							placeholder={`Select ${name}`}
							{...register(name)}
							onChange={async (e) => {
								register(name).onChange(e);
								if (
									onChange &&
									checkAllRulesPass({
										formValues: getValues(),
										rules: onChangeRules,
									})
								) {
									await runTask.mutateAsync({
										pageId: pageId || '',
										userInput: userInput,
										row: selectedRow,
										functionCall: onChange,
										callType: 'task',
									});
								}
							}}
						>
							{options?.map((o: any) => <option key={o}>{o}</option>)}
						</Select>
					</FormControl>
				</Box>
			);
		}

		if (type === 'number') {
			return (
				<Box>
					<FormControl>
						<FormLabel htmlFor={name}>{name}</FormLabel>
						<NumberInput>
							<NumberInputField id={name} placeholder={name} {...register(name)} />
						</NumberInput>
					</FormControl>
				</Box>
			);
		}

		return (
			<Box>
				<FormControl>
					<FormLabel htmlFor={name}>{name}</FormLabel>
					<ChakraInput id={name} placeholder={name} {...register(name)} />
				</FormControl>
			</Box>
		);
	}

	return null;
};

export const CustomButton = (props: any) => {
	const { label, action, post_action, getData } = props;
	const setRunResult = useSetAtom(runResultAtom);
	const runTask = useRunFunction({
		onSuccess: (response: any) => {
			if (typeof response.result !== 'string') {
				response.result = JSON.stringify(response.result);
			}
			setRunResult(response);
		},
	});
	const { pageId } = useParams();
	const [selectedRow] = useAtom(selectedRowAtom);
	const [userInput] = useAtom(userInputAtom);
	// const
	const handleAction = async () => {
		try {
			await runTask.mutateAsync({
				pageId: pageId || '',
				userInput: userInput,
				row: selectedRow,
				functionCall: action,
				callType: 'task',
			});
			// reset(resetFields);
			if (post_action) {
				console.log(`Performing post action: ${post_action}`);
				await getData(post_action);
			}
		} catch (e) {
			//
		}
	};

	return (
		<Button isLoading={runTask.isLoading} onClick={handleAction} marginTop="2">
			{label}
		</Button>
	);
};
