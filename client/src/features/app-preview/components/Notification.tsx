import { Circle, Icon, Stack, Text } from '@chakra-ui/react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'react-feather';

const icon: any = {
	success: CheckCircle,
	warn: AlertTriangle,
	error: AlertCircle,
};

const colors: any = { success: 'green', warn: 'yellow', error: 'red' };

export const Notification = ({ message, type, onClose }: any) => {
	if (!message) {
		return null;
	}

	const color = `${colors?.[type] || 'blue'}.500`;

	return (
		<Stack
			p={2.5}
			flexShrink="0"
			pos="absolute"
			mt="auto"
			borderWidth="1px"
			shadow="sm"
			bg="gray.50"
			zIndex="popover"
			bottom="0"
			right="10px"
			maxW="sm"
			mx="auto"
			w="calc(100% - 20px)"
			mb="10px"
			flexGrow="0"
			borderRadius="md"
		>
			<Stack spacing={1} direction="row" alignItems="center">
				<Icon
					boxSize={7}
					aria-label="Delete function"
					as={icon?.[type] || Info}
					p={1}
					color={color}
				/>
				<Text fontSize="md">{message}</Text>
			</Stack>

			<Circle
				cursor="pointer"
				position="absolute"
				top={-3}
				size={6}
				right={-2}
				alignItems="center"
				alignSelf="start"
				justifySelf="start"
				aria-label="Close alert"
				bg="white"
				borderColor={color}
				borderWidth="1px"
				_hover={{
					bg: `${colors?.[type] || 'blue'}.50`,
				}}
				color={color}
				onClick={onClose}
			>
				<X size="14" />
			</Circle>
		</Stack>
	);
};
