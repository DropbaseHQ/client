import { Stack } from '@chakra-ui/react';

import { WidgetProperties } from './WidgetProperties';
import { Components } from './ComponentEditor';

export const WidgetConfig = () => {
	return (
		<Stack m="3" bg="white" p="3" borderWidth="1px" borderRadius="sm" maxW="container.sm">
			<WidgetProperties />
			<Components />
		</Stack>
	);
};
