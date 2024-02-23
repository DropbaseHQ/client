import {
	getLuminance,
	getMiddleCenterBias,
	measureTextCached,
	roundedRect,
} from '@glideapps/glide-data-grid';
import { DropdownCell } from '@glideapps/glide-data-grid-cells';

const BUBBLE_HEIGHT = 20;
const BUBBLE_PADDING = 6;

export default {
	...DropdownCell,
	draw: (args: any, cell: any) => {
		const { ctx, theme, rect } = args;
		const { value } = cell.data;
		const foundOption = cell.data.allowedValues.find((opt: any) => {
			if (typeof opt === 'string' || opt === null || opt === undefined) {
				return opt === value;
			}
			return opt.value === value;
		});

		const displayText =
			typeof foundOption === 'string' ? foundOption : foundOption?.label ?? '';

		if (displayText) {
			const drawArea: any = {
				x: rect.x + theme.cellHorizontalPadding,
				y: rect.y + theme.cellVerticalPadding,
				width: rect.width - 2 * theme.cellHorizontalPadding,
				height: rect.height - 2 * theme.cellVerticalPadding,
			};
			const rows = Math.max(
				1,
				Math.floor(drawArea.height / (BUBBLE_HEIGHT + BUBBLE_PADDING)),
			);

			let { x } = drawArea;
			let row = 1;

			let y =
				rows === 1
					? drawArea.y + (drawArea.height - BUBBLE_HEIGHT) / 2
					: drawArea.y +
						(drawArea.height - rows * BUBBLE_HEIGHT - (rows - 1) * BUBBLE_PADDING) / 2;

			const matchedOption = foundOption;
			const color = matchedOption?.color ?? theme.bgBubble;

			const metrics = measureTextCached(displayText, ctx);
			const width = metrics.width + BUBBLE_PADDING * 2;
			const textY = BUBBLE_HEIGHT / 2;

			if (x !== drawArea.x && x + width > drawArea.x + drawArea.width && row < rows) {
				// eslint-disable-next-line no-plusplus
				row++;
				y += BUBBLE_HEIGHT + BUBBLE_PADDING;
				x = drawArea.x;
			}

			ctx.fillStyle = color;
			ctx.beginPath();
			roundedRect(ctx, x, y, width, BUBBLE_HEIGHT, theme.roundingRadius ?? BUBBLE_HEIGHT / 2);
			ctx.fill();

			// If a color is set for this option, we use either black or white as the text color depending on the background.
			// Otherwise, use the configured textBubble color.
			// eslint-disable-next-line no-nested-ternary
			ctx.fillStyle = matchedOption?.color
				? getLuminance(color) > 0.5
					? '#000000'
					: '#ffffff'
				: theme.textBubble;
			ctx.fillText(
				displayText,
				x + BUBBLE_PADDING,
				y + textY + getMiddleCenterBias(ctx, theme),
			);
		}
		return true;
	},
};
