import { Box, Center, CenterProps } from '@chakra-ui/react';
import styled from '@emotion/styled';
import { PanelResizeHandle } from 'react-resizable-panels';

interface PanelHandleProps extends CenterProps {
	direction: 'vertical' | 'horizontal';
}

const PanelStyled = styled(Center)`
	position: relative;
	::before {
		content: '';
		position: absolute;
		z-index: 99;
		${(props: any) => {
			if (props.direction === 'horizontal') {
				return {
					top: '-3px',
					height: '8px',
					width: '100%',
					background: 'transparent',
				};
			}

			return {
				right: '-3px',
				width: '8px',
				height: '100%',
				background: 'transparent',
			};
		}};
	}
`;

export const PanelHandle = ({ direction, ...props }: PanelHandleProps) => {
	const isHorizontalLine = direction === 'horizontal';

	return (
		<PanelResizeHandle>
			<PanelStyled
				direction={direction}
				role="group"
				flexShrink="0"
				w={isHorizontalLine ? 'full' : '1px'}
				h={isHorizontalLine ? '1px' : 'full'}
				transition="all ease .2s"
				bg="gray.200"
				_hover={{
					bg: 'blue.500',
				}}
				{...props}
			/>
		</PanelResizeHandle>
	);
};
