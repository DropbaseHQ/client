import { Button, Tooltip } from '@chakra-ui/react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAtomValue, useSetAtom } from 'jotai';
import { promptAtom } from '@/features/ai/atoms';
import { appModeAtom } from '@/features/app/atoms';
import { GradientIcon } from './GradientIcon';

export const PromptButton = () => {
	const { isPreview } = useAtomValue(appModeAtom);
	const setPrompt = useSetAtom(promptAtom);

	const handleClick = () => {
		setPrompt({
			isOpen: true,
		});
	};

	const gradientStyle = {
		background: 'linear-gradient(90deg, #06f, #3ccf91)',
		WebkitBackgroundClip: 'text',
		color: 'transparent',
	};

	useHotkeys('ctrl+k, meta+k', handleClick);

	if (isPreview) {
		return null;
	}

	return (
		<Tooltip label="AI Dev">
			<Button
				size="sm"
				variant="secondary"
				colorScheme="blue"
				leftIcon={<GradientIcon />}
				aria-label="Preview"
				ml="auto"
				mr="2"
				onClick={handleClick}
			>
				<p style={gradientStyle}>AI Dev</p>
			</Button>
		</Tooltip>
	);
};
