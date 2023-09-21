import {
	Box,
	Button,
	Flex,
	SimpleGrid,
	Skeleton,
	Stack,
	Text
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { WORKSPACE_ID } from '@/features/sources/constant';
import { useSources } from '@/features/sources/hooks';
import { SourceGraphic } from '@/features/sources/SourceGraphic';

const SourceCard = ({ source }: { source: any }) => {
	const navigate = useNavigate();
	const handleClick = () => {
		// TODO add view/edit
		navigate(`/apps`);
	};
	return (
		<Flex
			rounded="md"
			borderWidth="1px"
			borderColor="gray.200"
			borderRadius="md"
			alignItems="center"
			justifyContent="space-around"
			cursor="pointer"
			p="2"
			_hover={{
				bg: 'gray.100',
			}}
			onClick={handleClick}
		>
			<Flex flex="1" alignItems="center" justifyContent="center">
				<SourceGraphic />
			</Flex>
			<Box flex="2">
				<Text size="md" fontWeight="semibold">{source?.name}</Text>
				<Text fontSize="sm" color="gray.600">{source?.description || "(no description)"}</Text>
			</Box>
		</Flex>
	);
};

export const Sources = () => {
	const { isLoading, sources } = useSources(WORKSPACE_ID);

	if (isLoading) {
		return <Skeleton minH="container.sm" />;
	}

	return (
		<Stack p="6">
			<Stack direction="row">
				<Text fontWeight="bold" fontSize="xl">
					Sources
				</Text>
				<Button ml="auto" size="sm" variant="ghost" as={Link} to="new">
					New Source
				</Button>
			</Stack>
			<SimpleGrid columns={4} spacing={4}>
				{sources.map((source: any) => (
					<SourceCard key={source.id} source={source} />
				))}
			</SimpleGrid>
		</Stack>
	);
};
