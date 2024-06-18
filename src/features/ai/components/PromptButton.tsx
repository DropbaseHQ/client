import { Button, Tooltip } from '@chakra-ui/react';
import { Zap } from 'react-feather';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAtomValue, useSetAtom } from 'jotai';
import { promptAtom } from '@/features/ai/atoms';
import { appModeAtom } from '@/features/app/atoms';

const GradientIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#06f', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#3ccf91', stopOpacity: 1 }} />
			</linearGradient>
		</defs>
		<Zap stroke="url(#gradient1)" />
	</svg>
);

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
		<Tooltip label="App Developer">
			<Button
				size="sm"
				variant="secondary"
				colorScheme="blue"
				leftIcon={<GradientIcon />}
				aria-label="Preview"
				ml="auto"
				mr="2"
			>
				<p style={gradientStyle}>AI Dev</p>
			</Button>
		</Tooltip>
	);
};
