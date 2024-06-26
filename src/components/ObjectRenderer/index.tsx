import { Box, Code, Collapse, Stack, Text, useDisclosure } from '@chakra-ui/react';
import copy from 'copy-to-clipboard';

import { useToast } from '@/lib/chakra-ui';

const ClickableCode = ({ children, ...props }: any) => {
	return (
		<Code
			cursor="pointer"
			fontSize="sm"
			_hover={{ bg: 'gray.100' }}
			colorScheme="white"
			{...props}
		>
			{children}
		</Code>
	);
};

export const ObjectRenderer = ({ obj, title, path, expandedPaths, isArray }: any) => {
	const toast = useToast();

	const { isOpen, onToggle } = useDisclosure({
		defaultIsOpen: expandedPaths?.includes(path),
	});

	if (!title) {
		return (
			<Stack spacing="0">
				{Object.keys(obj).map((k) => (
					<ObjectRenderer
						expandedPaths={expandedPaths}
						path={k}
						key={k}
						isArray={Array.isArray(obj)}
						obj={obj}
						title={k}
					/>
				))}
			</Stack>
		);
	}

	return (
		<>
			<Box
				w="full"
				_hover={{ bg: 'gray.50' }}
				cursor="pointer"
				onClick={onToggle}
				px="0.5"
				py="1"
			>
				<Stack spacing="1" alignItems="center" direction="row">
					<ClickableCode
						color="gray.900"
						as="span"
						onClick={(e: any) => {
							e.stopPropagation();
							copy(path);
							toast({
								status: 'info',
								title: 'Path copied',
							});
						}}
					>
						{title}
					</ClickableCode>

					{isOpen ? null : <Box fontSize="xs">...</Box>}
				</Stack>
			</Box>
			<Collapse in={isOpen} animateOpacity>
				<Stack spacing="0" ml="4" borderLeftWidth="1px">
					{Object.keys(obj[title]).length === 0 ? (
						<Text fontSize="xs" color="gray.500" p="2">
							No content present
						</Text>
					) : null}

					{Object.keys(obj[title]).map((key) => {
						const value = obj[title][key];
						const accumulatedPath = isArray
							? `${path ? `${path}` : ''}[${key}]`
							: `${path ? `${path}.` : ''}${key}`;

						if (typeof value === 'object' && value !== null) {
							return (
								<ObjectRenderer
									path={accumulatedPath}
									key={key}
									title={key}
									isArray={Array.isArray(value)}
									expandedPaths={expandedPaths}
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
										copy(accumulatedPath);
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
			</Collapse>
		</>
	);
};
