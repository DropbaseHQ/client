import { useState } from 'react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useGetPage } from '@/features/page';
import { InputRenderer } from '@/components/FormInput';

//
export const AttachWidget = () => {
	const [selectedWidget, setWidget] = useState(null);
	const { appName, pageName } = useParams();

	const { widgets } = useGetPage({ appName, pageName });

	return (
		<FormControl>
			<FormLabel>Attach Widget</FormLabel>
			<InputRenderer
				type="select"
				options={widgets.map((t: any) => ({
					name: t.label,
					value: t.name,
				}))}
				validation={{ required: 'Cannot  be empty' }}
				name="Select Table"
				id="table"
				onChange={setWidget}
				value={selectedWidget}
			/>
		</FormControl>
	);
};
