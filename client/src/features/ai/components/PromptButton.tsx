import { IconButton } from '@chakra-ui/react';
import { Aperture } from 'react-feather';
import { useSetAtom } from 'jotai';
import { PromptType, promptAtom } from '@/features/ai/atoms';

export const PromptButton = ({ resource, name, block }: Omit<PromptType, 'prompt'>) => {
	const setPrompt = useSetAtom(promptAtom);

	const handleClick = () => {
		setPrompt({
			resource,
			name,
			block,
		});
	};

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
