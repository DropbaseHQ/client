import { useEffect, useState } from 'react';
import { FormControl, Stack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useGetPage, useUpdatePageData } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';
import { useCurrentTableName } from '@/features/smart-table/hooks';
import { useToast } from '@/lib/chakra-ui';
import { getErrorMessage } from '@/utils';
import { useGetTable } from '@/features/app-builder/hooks';

export const AttachWidget = ({ onAttach }: any) => {
	const [selectedWidget, setWidget] = useState(null);
	const { appName, pageName } = useParams();

	const toast = useToast();

	const { properties } = useGetPage({ appName, pageName });
	const tableName = useCurrentTableName();

	const { widget: tableWidget } = useGetTable(tableName || '');

	const { widgets } = useGetPage({ appName, pageName });

	useEffect(() => {
		setWidget(tableWidget);
	}, [tableWidget]);

	const mutation = useUpdatePageData({
		onSuccess: () => {
			toast({
				title: 'Attached table widget',
				status: 'success',
			});
			onAttach?.();
		},
		onError: (error: any) => {
			toast({
				title: 'Failed to attach widget',
				description: getErrorMessage(error),
				status: 'error',
			});
		},
	});

	const onChange = async (newWidget: any) => {
		try {
			await mutation.mutateAsync({
				app_name: appName,
				page_name: pageName,
				properties: {
					...(properties || {}),
					blocks: [
						...(properties?.blocks || []).map((t: any) => {
							if (t.name === tableName) {
								return {
									...t,
									widget: newWidget || null,
								};
							}

							return t;
						}),
					],
				},
			});

			setWidget(newWidget);
		} catch (e) {
			//
		}
	};

	return (
		<FormControl>
			<Stack direction="row">
				<InputRenderer
					type="select"
					options={widgets
						.filter((w: any) => w.type === 'inline')
						.map((t: any) => ({
							name: t.label,
							value: t.name,
						}))}
					validation={{ required: 'Cannot  be empty' }}
					name="Select Table"
					placeholder={selectedWidget ? 'Clear widget' : 'Attach inline widget'}
					id="table"
					onChange={onChange}
					value={selectedWidget}
				/>
			</Stack>
		</FormControl>
	);
};
