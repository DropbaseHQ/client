import { Center, CenterProps } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import { PanelResizeHandle } from 'react-resizable-panels';

export const PanelHandleContainer = ({ children, ...props }: PropsWithChildren<CenterProps>) => {
	return (
		<PanelResizeHandle>
			<Center
				_hover={{
					borderColor: 'gray.200',
					boxShadow: '0px 2px 5px rgba(0,0,0,.1) inset',
				}}
				{...props}
			>
				{children}
			</Center>
		</PanelResizeHandle>
	);
};
