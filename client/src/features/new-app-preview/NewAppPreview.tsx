import { FormControl, FormLabel, IconButton, Skeleton, Stack, Text } from '@chakra-ui/react';
import { RefreshCw } from 'react-feather';
import { useAtom } from 'jotai';

import { useGetWidgetPreview } from '@/features/new-app-preview/hooks';
import { InputRenderer } from '@/components/FormInput';
import { newUserInput } from '@/features/new-app-state';

export const NewAppPreview = () => {
	const { isLoading, refetch, components, widget, isRefetching } = useGetWidgetPreview(
		'62a43f32-89f6-4143-a8e9-57cbdf0889b1',
	);

	const [userInput, setUserInput] = useAtom(newUserInput) as any;

	return (
		<Stack bg="white" h="full">
			<Skeleton isLoaded={!isLoading}>
				<Stack
					px="4"
					py="2"
					borderBottomWidth="1px"
					direction="row"
					alignItems="center"
					justifyContent="space-between"
				>
					<Stack spacing="0">
						<Text fontSize="md" fontWeight="semibold">
							{widget?.property?.name}
						</Text>
						{widget?.property?.description ? (
							<Text fontSize="sm" color="gray.600">
								{widget?.property?.description}
							</Text>
						) : null}
					</Stack>

					<IconButton
						aria-label="Refresh UI"
						size="xs"
						icon={<RefreshCw size="14" />}
						variant="outline"
						isLoading={isRefetching}
						onClick={() => refetch()}
					/>
				</Stack>
				<Stack p="4">
					{components.map((c: any) => {
						const component = c.property;

						return (
							<FormControl key={component.name}>
								<FormLabel>{component.label}</FormLabel>

								<InputRenderer
									value={userInput?.[component.name]}
									name={component.name}
									type={component.type}
									onChange={(newValue: any) => {
										setUserInput((oldInputs: any) => {
											return {
												...oldInputs,
												[component.name]: newValue,
											};
										});
									}}
								/>
							</FormControl>
						);
					})}
				</Stack>
			</Skeleton>
		</Stack>
	);
};
