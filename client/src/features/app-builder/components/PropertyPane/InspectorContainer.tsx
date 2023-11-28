import { Box, useDisclosure } from '@chakra-ui/react';
import { useAtom, useAtomValue } from 'jotai';

import { inspectedResourceAtom } from '@/features/app-builder/atoms';
import { appModeAtom } from '@/features/app/atoms';

export const InspectorContainer = ({ children, noPadding, id, type, ...props }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [activeInspect, setActiveInspect] = useAtom(inspectedResourceAtom);

	const { isPreview } = useAtomValue(appModeAtom);

	const isCurrentComponent = id === activeInspect.id && activeInspect.type === type;
	const activeHover = isOpen || isCurrentComponent;

	const handleInspect = () => {
		setActiveInspect({
			id,
			type,
		});
	};

	if (!id || !type || isPreview) {
		return children;
	}

	return (
		<Box
			onMouseEnter={onOpen}
			onMouseOver={onOpen}
			onMouseLeave={onClose}
			onClick={handleInspect}
			{...props}
			pos="relative"
		>
			{children}

			<Box
				outline="2px solid"
				borderRadius="sm"
				borderWidth="5px"
				borderColor="gray.50"
				outlineColor={isCurrentComponent ? 'blue.500' : 'gray.500'}
				pos="absolute"
				top="-5px"
				left="-5px"
				w="calc(100% + 10px)"
				h="calc(100% + 10px)"
				shadow="md"
				pointerEvents="none"
				transition="all ease .2s"
				opacity={activeHover ? '1' : '0'}
			/>
		</Box>
	);
};
