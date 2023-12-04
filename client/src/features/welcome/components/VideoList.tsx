import { Center, Circle, Image, Link, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import styled from '@emotion/styled';
import { Play } from 'react-feather';

const list = [
	{
		name: 'Build an approval app',
		thumbnail: '/thumbnail/approval.png',
		link: 'https://youtube.com',
	},
	{
		name: 'Build a data editor',
		thumbnail: '/thumbnail/editor.png',
		link: 'https://youtube.com',
	},
	{
		name: 'Build an Email notifier',
		thumbnail: '/thumbnail/email.png',
		link: 'https://youtube.com',
	},
	{
		name: 'Build an admin panel',
		thumbnail: '/thumbnail/admin.png',
		link: 'https://youtube.com',
	},
];

const VideoContainer = styled(Stack)`
	.play-button {
		display: none;
	}

	&:hover {
		.play-button {
			display: flex;
		}
	}
`;

export const VideoList = () => {
	return (
		<SimpleGrid spacing={6} columns={4}>
			{list.map((video) => (
				<VideoContainer p="2" textAlign="center">
					<Stack
						as={Link}
						href={video.link}
						isExternal
						cursor="pointer"
						maxW="md"
						position="relative"
					>
						<Image borderRadius="sm" src={video.thumbnail} />
						<Center
							zIndex={2}
							position="absolute"
							bg="blackAlpha.500"
							borderRadius="sm"
							top="0"
							left="0"
							w="full"
							h="full"
							className="play-button"
						>
							<Circle bg="white" shadow="sm" size="10" color="blue.500">
								<Play size="18" />
							</Circle>
						</Center>
					</Stack>
					<Text fontWeight="medium">{video.name}</Text>
				</VideoContainer>
			))}
		</SimpleGrid>
	);
};
