import { IconButton } from '@chakra-ui/react';
import { Aperture } from 'react-feather';
import { useAtomValue, useSetAtom } from 'jotai';
import { PromptType, promptAtom } from '@/features/ai/atoms';
import { appModeAtom } from '@/features/app/atoms';

export const PromptButton = ({ resource, name, block }: Omit<PromptType, 'prompt'>) => {
	const { isPreview } = useAtomValue(appModeAtom);
	const setPrompt = useSetAtom(promptAtom);

	const handleClick = () => {
		setPrompt({
			resource,
			name,
			block,
		});
	};

	if (isPreview) {
		return null;
	}

	return (
		<IconButton
			aria-label="Open AI Prompt"
			icon={<Aperture size="16" />}
			size="xs"
			flexGrow="0"
			variant="outline"
			colorScheme="yellow"
			onClick={handleClick}
		/>
	);
};
