import { Button, SimpleGrid, Skeleton, Stack, Text } from '@chakra-ui/react';
import { useAtomValue } from 'jotai';
import { Database } from 'react-feather';
import { Link } from 'react-router-dom';
import { useSources } from '@/features/sources/hooks';
import { workspaceAtom } from '@/features/workspaces';
import { PageLayout } from '@/layout';

export const Sources = () => {
	const workspaceId = useAtomValue(workspaceAtom);
	const { isLoading, sources } = useSources(workspaceId);

	return (
		<PageLayout
			title="Sources"
			action={
				<Button ml="auto" size="sm" as={Link} to="new">
					New Source
				</Button>
			}
		>
			<SimpleGrid columns={4} spacing={4}>
				{isLoading ? (
					<>
						<Skeleton minH="24" />
						<Skeleton minH="24" />
						<Skeleton minH="24" />
						<Skeleton minH="24" />
					</>
				) : (
					sources.map((source: any) => (
						<Stack
							borderWidth="1px"
							borderColor="gray.200"
							bg="white"
							borderRadius="md"
							alignItems="center"
							direction="row"
							cursor="pointer"
							p="4"
							spacing="4"
							transition="all ease .2s"
							_hover={{
								shadow: 'xs',
								borderColor: 'gray.300',
							}}
						>
							<Database size="34" />
							<Stack spacing="0">
								<Text fontSize="lg" fontWeight="semibold">
									{source?.name}
								</Text>
								{source?.description ? (
									<Text fontSize="sm" color="gray.600">
										{source?.description}
									</Text>
								) : null}
							</Stack>
						</Stack>
					))
				)}
			</SimpleGrid>
		</PageLayout>
	);
};
