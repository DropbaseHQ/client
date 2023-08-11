/* eslint-disable  */
import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { useGetUIJson } from '@/features/app/hooks/useGetUIJson';
import { CustomInput } from '@/utils/uiBuilder';

export const UIPreview = () => {
	const methods = useForm({
		shouldUnregister: true,
	});
	const { components } = useGetUIJson();

	const [formData, setFormData] = useState(components); // Assuming 'data' is defined somewhere
	const sortUI = (components: any) =>
		components.map((c: any) => {
			const UIType = Object.keys(c)[0];
			const props = c[UIType];
			console.log('props', props);
			if (UIType === 'UIInput') {
				return <CustomInput key={props.name} {...props} setFormData={setFormData} />;
			}
		});

	return (
		<Box p="0">
			<FormProvider {...methods}>{sortUI(components)}</FormProvider>
		</Box>
	);
};
