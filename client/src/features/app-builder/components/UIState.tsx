import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	Code,
	IconButton,
	Stack,
	Text,
	useClipboard,
} from '@chakra-ui/react';
import { CheckSquare, Copy } from 'react-feather';

import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { selectedRowAtom, userInputAtom } from '../atoms/tableContextAtoms';

const ObjectRenderer = ({ obj, title, ...props }: any) => {
	const { onCopy, setValue, value: copiedValue, hasCopied } = useClipboard('');

	useEffect(() => {
		if (copiedValue) {
			onCopy();
		}
	}, [onCopy, copiedValue]);

	if (!title) {
		return Object.keys(obj).map((k) => <ObjectRenderer key={k} obj={obj} title={k} />);
	}

	return (
		<AccordionItem {...props}>
			<AccordionButton>
				<Stack spacing="1" alignItems="center" direction="row">
					<Code colorScheme="white" as="span">
						{title}
					</Code>
					<IconButton
						variant="ghost"
						onClick={(e) => {
							e.stopPropagation();
							setValue(title);
						}}
						colorScheme="gray"
						size="sm"
						p="0"
						_hover={{
							color: 'gray.600',
						}}
						_focus={{
							bg: 'transparent',
						}}
						h="fit-content"
						w="fit-content"
						aria-label="Copy"
						color={hasCopied ? 'green.500' : 'gray.500'}
						icon={hasCopied ? <CheckSquare size="14" /> : <Copy size="14" />}
					/>
				</Stack>
			</AccordionButton>
			<AccordionPanel p="0" borderTopWidth="1px">
				<Stack spacing="0" ml="6" borderLeftWidth="1px">
					{Object.keys(obj[title]).length === 0 ? (
						<Text fontSize="sm" color="gray.500" p="2">
							No content present
						</Text>
					) : null}

					{Object.keys(obj[title]).map((key) => {
						const value = obj[title][key];

						if (typeof value === 'object') {
							return (
								<ObjectRenderer
									borderTop="0"
									borderBottom="0"
									key={key}
									title={key}
									obj={obj[title]}
								/>
							);
						}

						return (
							<Stack
								alignItems="center"
								direction="row"
								p="2"
								key={key}
								justifyContent="space-between"
							>
								<Code flex="1" colorScheme="white">
									{key}
								</Code>
								<Code
									flexGrow="0"
									overflow="hidden"
									bg="gray.50"
									p="0.5"
									textOverflow="ellipsis"
									flex="1"
									whiteSpace="nowrap"
								>
									{value}
								</Code>
							</Stack>
						);
					})}
				</Stack>
			</AccordionPanel>
		</AccordionItem>
	);
};

export const UIState = () => {
	const userInput: any = useAtomValue(userInputAtom);
	const selectedRow = useAtomValue(selectedRowAtom);

	const builderContext = {
		userInput,
		selectedRow,
	};

	// const state = JSON.stringify(builderContext, null, 4);

	return (
		<Accordion h="full" bg="white" allowMultiple>
			<ObjectRenderer obj={builderContext} />
		</Accordion>
	);
};
