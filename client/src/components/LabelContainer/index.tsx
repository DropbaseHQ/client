import { Code, Stack, Text } from '@chakra-ui/react';

export const LabelContainer = ({ children, ...props }: any) => {
	return (
		<Stack direction="row" display="flex" alignItems="center" {...props}>
			{children}
		</Stack>
	);
};

const Label = ({ children, ...props }: any) => {
	return (
		<Text
			textOverflow="ellipsis"
			overflow="hidden"
			whiteSpace="nowrap"
			fontSize="lg"
			fontWeight="semibold"
			{...props}
		>
			{children}
		</Text>
	);
};

const LabelCode = ({ children, ...props }: any) => {
	return (
		<Code fontSize="sm" bg="transparent" color="gray.600" {...props}>
			{children}
		</Code>
	);
};

LabelContainer.Label = Label;
LabelContainer.Code = LabelCode;
