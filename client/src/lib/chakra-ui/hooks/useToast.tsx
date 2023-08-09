import {
	useToast as useToastLib,
	Stack,
	Box,
	useTheme,
	Circle,
	useColorMode,
} from '@chakra-ui/react';
import { AlertCircle, CheckCircle, Info } from 'react-feather';

export const ToastContent = ({
	icon,
	title,
	description,
	onClose,
}: {
	icon?: any;
	title?: any;
	description?: any;
	onClose?: any;
}) => {
	const isLightMode = useColorMode().colorMode === 'light';
	return (
		<Stack spacing="2" alignItems="start" direction="row">
			{icon ? <Box>{icon}</Box> : null}
			<Stack flex="2" spacing="0.5" position="relative">
				{title ? (
					<Box lineHeight={1} fontWeight="medium" fontSize="sm">
						{title}
					</Box>
				) : null}

				{description ? (
					<Box fontSize="xs" color="muted">
						{description}
					</Box>
				) : null}
			</Stack>
			<Circle
				cursor="pointer"
				size="5"
				_hover={{
					bg: isLightMode ? 'gray.400' : 'gray.700',
				}}
				onClick={onClose}
				border="1px solid"
				borderColor={isLightMode ? 'gray.300' : 'gray.600'}
				color="muted"
				aria-label="Close toast"
			>
				<X size="12" />
			</Circle>
		</Stack>
	);
};

export const toastProps: any = (theme: any, isLightMode: boolean) => ({
	position: 'bottom-right',
	containerStyle: {
		background: theme.colors.gray[isLightMode ? '50' : '800'],
		padding: theme.space[3],
		borderRadius: theme.space[1],
		border: '1px solid',
		borderColor: theme.colors.gray[isLightMode ? '200' : '700'],
	},
});

export const useToast = () => {
	const toast = useToastLib();

	const theme = useTheme();
	const isLightMode = useColorMode().colorMode === 'light';

	const toastObject = ({
		title,
		description,
		status = 'info',
	}: {
		title?: any;
		description?: any;
		status?: 'success' | 'warning' | 'error' | 'info';
	}) => {
		const renderIcon = () => {
			switch (status) {
				case 'error': {
					return (
						<Box color="red.500">
							<AlertCircle size="15" />
						</Box>
					);
				}

				case 'warning': {
					return (
						<Box color="yellow.500">
							<AlertCircle size="15" />
						</Box>
					);
				}

				case 'success': {
					return (
						<Box color="green.500">
							<CheckCircle size="15" />
						</Box>
					);
				}

				case 'info': {
					return (
						<Box color="blue.500">
							<Info size="15" />
						</Box>
					);
				}

				default:
					return null;
			}
		};

		return toast({
			...toastProps(theme, isLightMode),
			render: ({ onClose, id }) => {
				return (
					<ToastContent
						icon={renderIcon()}
						onClose={onClose}
						title={title}
						description={description}
					/>
				);
			},
		});
	};

	toastObject.close = toast.close;

	return toastObject;
};
