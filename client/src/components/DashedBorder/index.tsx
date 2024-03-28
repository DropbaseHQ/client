import { Box } from '@chakra-ui/react';

export const DashedBorder = ({ children, ...props }: any) => {
	return (
		<Box
			w="full"
			p="2"
			bg="white"
			borderWidth="1px"
			borderStyle="dashed"
			borderRadius="md"
			{...props}
		>
			{children}
		</Box>
	);
};
