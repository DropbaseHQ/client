import axios from 'axios';
import { useQuery } from 'react-query';

const fetchUIJson = async ({ code, app_id }: { code: string; app_id: string }) => {
	const { data } = await axios.post('http://localhost:8000/components/some_id/convert', {
		code,
		app_id,
		// code: 'name_input = UIInput(\r\n    name="name",\r\n    type="input",\r\n    label="Name",\r\n    required=True,\r\n    validation="",\r\n    error="",\r\n    number=3\r\n)\r\naddress_input = UIInput(\r\n    name="address",\r\n    type="input",\r\n    label="Address",\r\n    required=True,\r\n    validation="",\r\n    error="",\r\n    number=3,\r\n    depends="name",\r\n    depends_value="John"\r\n)',
		// app_id: '1234',
	});
	return data;
};

export const useGetUIJson = ({ code, app_id }: { code: string; app_id: string }) => {
	const { data, ...rest } = useQuery('uiJson', () => fetchUIJson({ code, app_id }));
	const components = data?.components || [];
	const parsedComponents = components.map((c: any) => {
		const parsedComponent = JSON.parse(c);
		return parsedComponent;
	});
	return { components: parsedComponents, ...rest };
};
