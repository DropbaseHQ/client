import { IconButton } from '@chakra-ui/react';
import { Aperture } from 'react-feather';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAtomValue, useSetAtom } from 'jotai';
import { promptAtom } from '@/features/ai/atoms';
import { appModeAtom } from '@/features/app/atoms';

export const PromptButton = () => {
	const { isPreview } = useAtomValue(appModeAtom);
	const setPrompt = useSetAtom(promptAtom);

	const handleClick = () => {
		setPrompt({
			isOpen: true,
		});
	};

	useHotkeys('ctrl+k, meta+k', handleClick);

	if (isPreview) {
		return null;
	}

	return (
		<IconButton
			aria-label="Open AI Prompt"
			icon={<Aperture size="16" />}
			size="sm"
			flexGrow="0"
			variant="outline"
			colorScheme="yellow"
			onClick={handleClick}
		/>
	);
};
