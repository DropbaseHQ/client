import { Badge, Icon, Stack, Text } from '@chakra-ui/react';
import { Table } from 'react-feather';
import { FormInput } from '@/components/FormInput';

export const SelectDataFetcher = ({ fetchers, ...rest }: any) => (
	<FormInput
		type="custom-select"
		id="fetcher"
		placeholder="Select data fetcher"
		{...rest}
		options={(fetchers as any).map((file: any) => ({
			name: file.name,
			value: file.name,
			icon: null,
			render: (isSelected: boolean) => {
				return (
					<Stack alignItems="center" direction="row">
						<Icon
							boxSize="5"
							as={Table}
							flexShrink="0"
							color={isSelected ? 'blue.500' : ''}
						/>
						<Stack spacing="0">
							<Text fontWeight="medium" fontSize="sm">
								{file.name}
							</Text>
						</Stack>
						<Badge
							textTransform="lowercase"
							size="xs"
							ml="auto"
							colorScheme={isSelected ? 'blue' : 'gray'}
						>
							.{file.type === 'sql' ? 'sql' : 'py'}
						</Badge>
					</Stack>
				);
			},
		}))}
	/>
);
