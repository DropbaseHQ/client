import { useAtomValue } from 'jotai';
import { Box, Stack, Text } from '@chakra-ui/react';
import { MousePointer } from 'react-feather';
import { inspectedResourceAtom } from '@/features/app-builder/atoms';

import { ComponentPropertyEditor } from '../PropertiesEditor/ComponentEditor';
import { TableConfig } from '../PropertiesEditor/TableConfig';
import { WidgetProperties } from '@/features/app-builder/components/PropertiesEditor/WidgetProperties';

import './monaco-suggestion-styles.css';

const EmptyPane = () => {
	return (
		<Stack as={Stack} p={6} bg="white" w="full" h="full">
			<Text lineHeight={1.4} fontSize="md">
				Select table or component to inspect properties
			</Text>
			<Stack
				w="full"
				borderWidth="1px"
				borderRadius="sm"
				p="4"
				bg="gray.50"
				position="relative"
			>
				<Box outline="2px solid" p="2" borderRadius="sm" outlineColor="blue.500">
					<Box
						h={8}
						bg="white"
						borderWidth="1px"
						p="1"
						px="2"
						color="gray.500"
						fontSize="sm"
					>
						Enter your input.....
					</Box>
				</Box>
				<MousePointer
					size="15"
					style={{
						position: 'absolute',
						bottom: '18px',
						right: '18px',
						fill: 'black',
					}}
				/>
			</Stack>
		</Stack>
	);
};

export const PropertyPane = () => {
	const { id, type } = useAtomValue(inspectedResourceAtom);

	if (!id || !type) {
		return <EmptyPane />;
	}

	let component = <EmptyPane />;

	if (type === 'component') {
		component = <ComponentPropertyEditor id={id} />;
	}

	if (type === 'table') {
		component = <TableConfig />;
	}

	if (type === 'widget') {
		component = <WidgetProperties widgetId={id} />;
	}

	return component;
};
