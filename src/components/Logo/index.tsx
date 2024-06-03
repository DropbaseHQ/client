import { Center, IconButton, Image, useDisclosure } from '@chakra-ui/react';

export const DropbaseLogo = ({ children, ...props }: any) => {
	const { isOpen, onClose, onOpen } = useDisclosure();

	const logo = <Image maxH="full" {...props} src="/logo.svg" alt="" />;

	if (children) {
		return (
			<Center
				cursor="pointer"
				tabIndex={0}
				h="full"
				onMouseEnter={onOpen}
				onFocus={onOpen}
				onMouseOver={onOpen}
				onMouseLeave={onClose}
				onBlur={onClose}
			>
				{isOpen ? children : logo}
			</Center>
		);
	}

	return logo;
};

export const DropbaseIcon = ({ children, icon, ...props }: any) => {
	const { isOpen, onClose, onOpen } = useDisclosure();

	const logo = <Image maxH="full" src="/logo.svg" alt="" />;

	return (
		<IconButton
			aria-label=""
			{...props}
			icon={isOpen ? icon : logo}
			onMouseEnter={onOpen}
			onFocus={onOpen}
			onMouseOver={onOpen}
			onMouseLeave={onClose}
			onBlur={onClose}
		/>
	);
};
