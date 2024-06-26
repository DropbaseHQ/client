import { Zap } from 'react-feather';

export const GradientIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" style={{ stopColor: '#06f', stopOpacity: 1 }} />
				<stop offset="100%" style={{ stopColor: '#3ccf91', stopOpacity: 1 }} />
			</linearGradient>
		</defs>
		<Zap stroke="url(#gradient1)" />
	</svg>
);
