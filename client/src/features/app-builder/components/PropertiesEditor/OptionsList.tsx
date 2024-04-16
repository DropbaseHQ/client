import { ChevronDown } from 'react-feather';

import {
	Stack,
	Box,
	Center,
	Menu,
	MenuButton,
	MenuItemOption,
	MenuList,
	Text,
	Portal,
} from '@chakra-ui/react';

const OptionsList = (props: any) => {
	const { selectedOptionLabel, displayType, optionsList, handleSelectChange } = props;

	return (
		<Menu>
			<Stack spacing="0.5">
				<MenuButton
					as={Stack}
					direction="row"
					alignItems="center"
					borderWidth="1px"
					p="1.5"
					borderRadius="sm"
					type="button"
					width="50%"
					// cursor={inputProps?.isDisabled ? 'not-allowed' : 'pointer'}
				>
					<Stack w="full" spacing="0" alignItems="center" direction="row">
						<Box>
							<Text fontSize="sm">
								{selectedOptionLabel || displayType || 'Select option'}
							</Text>
						</Box>
						<Box ml="auto">
							<ChevronDown size="14" />
						</Box>
					</Stack>
				</MenuButton>
			</Stack>
			<Portal>
				<MenuList
					zIndex="popover"
					// pointerEvents={inputProps?.isDisabled ? 'none' : 'initial'}
					borderRadius="sm"
					shadow="sm"
					p="0"
					maxH="sm"
					overflowY="auto"
				>
					{optionsList.length === 0 ? (
						<Center>
							<Text fontSize="sm">No options present</Text>
						</Center>
					) : (
						optionsList.map((option: any, index: any) => (
							<MenuItemOption
								fontSize="sm"
								key={option}
								value={option}
								data-cy={`select-option-${index}`}
								onClick={() => {
									handleSelectChange(option);
								}}
							>
								{option}
							</MenuItemOption>
						))
					)}
				</MenuList>
			</Portal>
		</Menu>
	);
};

export default OptionsList;
