import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	Box,
	Code,
	Stack,
	Text,
} from '@chakra-ui/react';
import copy from 'copy-to-clipboard';

import { useToast } from '@/lib/chakra-ui';

const ClickableCode = ({ children, ...props }: any) => {
	return (
		<Code
			cursor="pointer"
			fontSize="xs"
			_hover={{ bg: 'gray.100' }}
			colorScheme="white"
			{...props}
		>
			{children}
		</Code>
	);
};

export const ObjectRenderer = ({ obj, title, path, ...props }: any) => {
	const toast = useToast();

	if (!title) {
		return (
			<Accordion h="full" overflowY="auto" bg="white" allowMultiple>
				{Object.keys(obj).map((k) => (
					<ObjectRenderer path={k} key={k} obj={obj} title={k} />
				))}
			</Accordion>
		);
	}

	return (
		<AccordionItem border="0" {...props}>
			{({ isExpanded }) => (
				<>
					<AccordionButton px="0.5" py="1">
						<Stack spacing="1" alignItems="center" direction="row">
							<ClickableCode
								color="gray.900"
								as="span"
								onClick={() => {
									copy(path);
									toast({
										status: 'info',
										title: 'Path copied',
									});
								}}
							>
								{title}
							</ClickableCode>

							{isExpanded ? null : <Box fontSize="xs">...</Box>}
						</Stack>
					</AccordionButton>
					<AccordionPanel p="0">
						<Stack spacing="0" ml="4" borderLeftWidth="1px">
							{Object.keys(obj[title]).length === 0 ? (
								<Text fontSize="xs" color="gray.500" p="2">
									No content present
								</Text>
							) : null}

							{Object.keys(obj[title]).map((key) => {
								const value = obj[title][key];

								if (typeof value === 'object' && value !== null) {
									return (
										<ObjectRenderer
											borderTop="0"
											borderBottom="0"
											path={`${path ? `${path}.` : ''}${key}`}
											key={key}
											title={key}
											obj={obj[title]}
										/>
									);
								}

								return (
									<Stack
										color="gray.700"
										fontWeight="300"
										px="0.5"
										alignItems="center"
										direction="row"
										key={key}
									>
										<ClickableCode
											onClick={() => {
												copy(`${path}.${key}`);
												toast({
													status: 'info',
													title: 'Path copied',
												});
											}}
											flex="1"
										>
											{key}
										</ClickableCode>
										<Code
											flexGrow="0"
											fontSize="xs"
											overflow="hidden"
											bg="white"
											p="0.5"
											textOverflow="ellipsis"
											flex="1"
											whiteSpace="nowrap"
											color={
												value === null || value === undefined
													? 'gray.400'
													: 'gray.700'
											}
										>
											{String(value)}
										</Code>
									</Stack>
								);
							})}
						</Stack>
					</AccordionPanel>
				</>
			)}
		</AccordionItem>
	);
};
