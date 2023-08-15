import { Center, CenterProps } from '@chakra-ui/react';
import { MoreHorizontal, MoreVertical } from 'react-feather';
import { PanelResizeHandle } from 'react-resizable-panels';

interface PanelHandleProps extends CenterProps {
	direction: 'vertical' | 'horizontal';
}

export const PanelHandle = ({ direction, ...props }: PanelHandleProps) => {
	const centerProps =
		direction === 'horizontal'
			? {
					borderTopWidth: '1px',
					borderBottomWidth: '1px',
					w: 'full',
			  }
			: {
					borderLeftWidth: '1px',
					borderRightWidth: '1px',
					h: 'full',
			  };

	return (
		<PanelResizeHandle>
			<Center
				_hover={{
					borderColor: 'gray.200',
					boxShadow: '0px 2px 5px rgba(0,0,0,.1) inset',
				}}
				{...centerProps}
				{...props}
			>
				{direction === 'horizontal' ? (
					<MoreHorizontal size="18" />
				) : (
					<MoreVertical size="16" />
				)}
			</Center>
		</PanelResizeHandle>
	);
};
