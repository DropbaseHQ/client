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

export const ObjectRenderer = ({ obj, title, ...props }: any) => {
	if (!title) {
		return (
			<Accordion h="full" overflowY="auto" bg="white" allowMultiple>
				{Object.keys(obj).map((k) => (
					<ObjectRenderer key={k} obj={obj} title={k} />
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
							<Code color="gray.900" fontSize="xs" colorScheme="white" as="span">
								{title}
							</Code>

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
										<Code fontSize="xs" flex="1" colorScheme="white">
											{key}
										</Code>
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
