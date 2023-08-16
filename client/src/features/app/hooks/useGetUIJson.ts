import { axios } from '@/lib/axios';
import { useQuery } from 'react-query';

const fetchUIJson = async ({ code, app_id }: { code: string; app_id: string }) => {
	const { data } = await axios.post('components/some_id/convert', {
		code,
		app_id,
	});
	return data;
};

export const useGetUIJson = ({
	code = '',
	app_id = '',
}: { code?: string; app_id?: string } = {}) => {
	const { data, ...rest } = useQuery('uiJson', () => fetchUIJson({ code, app_id }));
	const components = data?.components || [];
	const parsedComponents = components.map((c: any) => {
		const parsedComponent = JSON.parse(c);
		return parsedComponent;
	});
	return { components: parsedComponents, ...rest };
};
