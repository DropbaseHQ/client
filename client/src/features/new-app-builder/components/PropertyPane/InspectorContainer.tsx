import { Box, useDisclosure } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { inspectedResourceAtom } from '@/features/new-app-builder/atoms';
import { appModeAtom } from '@/features/app/atoms';

export const InspectorContainer = ({ children, noPadding, id, type, ...props }: any) => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const [activeInspect, setActiveInspect] = useAtom(inspectedResourceAtom);

	const { isPreview } = useAtomValue(appModeAtom);

	const activeHover = isOpen || (id === activeInspect.id && activeInspect.type === type);

	const handleInspect = () => {
		setActiveInspect({
			id,
			type,
		});
	};

	useEffect(() => {
		return () => {
			setActiveInspect((current: any) => {
				if (id && type && current.id === id && current.type === type) {
					return {
						id: null,
						type: null,
					};
				}

				return current;
			});
		};
	}, [setActiveInspect, id, type]);

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
				borderWidth="10px"
				borderColor="gray.50"
				outlineColor="blue.500"
				pos="absolute"
				top="-10px"
				left="-10px"
				w="calc(100% + 20px)"
				h="calc(100% + 20px)"
				shadow="md"
				pointerEvents="none"
				transition="all ease .2s"
				opacity={activeHover ? '1' : '0'}
			/>
		</Box>
	);
};
