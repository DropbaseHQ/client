import { Button, SimpleGrid, Skeleton, Stack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { WORKSPACE_ID } from '@/features/sources/constant';
import { useSources } from '@/features/sources/hooks';

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
					<Stack p="4" spacing="0" borderWidth="1px" borderRadius="sm">
						<Text fontSize="md" fontWeight="semibold">
							{source?.name}
						</Text>
						{source?.description ? (
							<Text fontSize="sm" color="gray.600">
								{source?.description}
							</Text>
						) : null}
					</Stack>
				))}
			</SimpleGrid>
		</Stack>
	);
};
