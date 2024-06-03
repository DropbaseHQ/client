import {
	Accordion,
	AccordionButton,
	AccordionItem,
	AccordionPanel,
	Box,
	Code,
	Divider,
	Icon,
	Stack,
	Text,
} from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { AlertCircle, CheckCircle, FileText } from 'react-feather';

import { MonacoEditor } from '@/components/Editor';
import { ChakraTable } from '@/components/Table';
import { Log, logsAtom } from '../../atoms';
import { ObjectRenderer } from '@/components/ObjectRenderer';

export const FunctionLogs = () => {
	const { logs } = useAtomValue(logsAtom);

	return (
		<Stack bg="white" w="full" spacing="0" h="full">
			<Stack
				bg="gray.50"
				px="2"
				py="1"
				borderBottomWidth="1px"
				direction="row"
				alignItems="center"
			>
				<FileText size="12" />
				<Text fontWeight="medium" fontSize="sm">
					Logs & Traceback
				</Text>
			</Stack>

			<Stack overflowY="auto" overflowX="hidden" spacing="0">
				{logs.map((log) => {
					return (
						<Stack
							flexGrow="0"
							spacing="0"
							direction="row"
							key={log?.time}
							borderBottomWidth="1px"
						>
							<Stack p="2" w="xs" flexShrink="0">
								{log?.meta?.type === 'test' ? null : (
									<Stack
										spacing="2"
										divider={<Divider orientation="vertical" />}
										direction="row"
									>
										<Code bg="transparent">{log?.meta?.action}</Code>
										{log?.meta?.component ? (
											<Code bg="transparent">{log?.meta?.component}</Code>
										) : null}
										<Code bg="transparent">{log?.meta?.resource}</Code>
									</Stack>
								)}

								<ObjectRenderer
									obj={{ state: log?.meta?.state } || { state: {} }}
								/>

								<Stack direction="row" mt="auto" alignItems="center">
									<Code mt="auto" bg="transparent">
										{new Date(log.time).toLocaleString()}
									</Code>
									<Icon
										as={log?.type === 'failed' ? AlertCircle : CheckCircle}
										size="6"
										color={log?.type === 'failed' ? 'red.500' : 'green.500'}
										ml="auto"
									/>
								</Stack>
							</Stack>
							<Stack borderLeftWidth="1px" w="full">
								<Accordion allowToggle allowMultiple>
									{['message', 'stdout', 'traceback'].map((type, index) => {
										if (log?.[type as keyof Log]) {
											let message = log[type as keyof Log];

											if (typeof message !== 'string') {
												message = JSON.stringify(message);
											}

											return (
												<AccordionItem
													borderTopWidth={index === 0 ? '0px' : '1px'}
													key={type}
													borderBottomWidth="0px !important"
												>
													<AccordionButton>
														<Code bg="transparent">{type}</Code>
													</AccordionButton>

													<AccordionPanel borderTopWidth="1px" py="1">
														<MonacoEditor
															value={message}
															language="shell"
															height={`${Math.max(
																message.split('\n').length * 20,
																40,
															)}px`}
															options={{
																lineNumbers: 'off',
																readOnly: true,
																renderLineHighlight: 'none',
																scrollbar: {
																	verticalHasArrows: false,
																	alwaysConsumeMouseWheel: false,
																	vertical: false,
																	horizontal: false,
																},
															}}
														/>
													</AccordionPanel>
												</AccordionItem>
											);
										}

										return null;
									})}
								</Accordion>

								{log?.preview?.type === 'table' &&
								log?.preview?.columns?.length > 0 ? (
									<Box px="3" w="full" mt="3" pb="3" borderBottomWidth="1px">
										<ChakraTable
											{...log?.preview}
											columns={log?.preview?.columns?.map((c: any) => c.name)}
											maxH="md"
											borderRadius="sm"
										/>
									</Box>
								) : null}
							</Stack>
						</Stack>
					);
				})}
			</Stack>
		</Stack>
	);
};
