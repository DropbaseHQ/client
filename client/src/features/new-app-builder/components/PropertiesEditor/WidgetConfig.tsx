import { Box, Stack } from '@chakra-ui/react';

import { WidgetProperties } from './WidgetProperties';
import { Components } from './ComponentEditor';

// export const WidgetConfig = () => {
// 	return (
// 		<PanelGroup direction="horizontal">
// 			<Panel maxSize={50} defaultSize={35}>
// 				<Box p="3" m="3" borderWidth="1px" bg="white">
// 					<WidgetProperties />
// 				</Box>
// 			</Panel>
// 			<PanelHandle direction="vertical" />
// 			<Panel>
// 				<Box p="3" h="full" overflow="auto">
// 					<Components />
// 				</Box>
// 			</Panel>
// 		</PanelGroup>
// 	);
// };

export const WidgetConfig = () => {
	return (
		<Stack direction="row" alignItems="start" maxW="container.xl" p="3" spacing="3">
			<Box p="3" flex="2" borderWidth="1px" bg="white">
				<WidgetProperties />
			</Box>
			<Box h="full" flex="3" overflow="auto">
				<Components />
			</Box>
		</Stack>
	);
};
