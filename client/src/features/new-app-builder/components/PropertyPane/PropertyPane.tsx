import { useAtomValue } from 'jotai';
import { Box } from '@chakra-ui/react';
import { inspectedResourceAtom } from '@/features/new-app-builder/atoms';

import { ComponentPropertyEditor } from '../PropertiesEditor/ComponentEditor';
import { TableConfig } from '../PropertiesEditor/TableConfig';

export const PropertyPane = () => {
	const { id, type } = useAtomValue(inspectedResourceAtom);

	if (!id || !type) {
		return <Box h="full" w="full" bg="white" />;
	}

	let component = <Box h="full" w="full" bg="white" />;

	if (type === 'component') {
		component = <ComponentPropertyEditor id={id} />;
	}

	if (type === 'table') {
		component = <TableConfig />;
	}

	return component;
};
