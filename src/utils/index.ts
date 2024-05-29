import get from 'lodash/get';

export const PG_COLUMN_BASE_TYPE: any = {
	TEXT: 'text',
	VARCHAR: 'text',
	CHAR: 'text',
	CHARACTER: 'text',
	STRING: 'text',
	BINARY: 'text',
	VARBINARY: 'text',
	INTEGER: 'integer',
	INT: 'integer',
	BIGINT: 'integer',
	SMALLINT: 'integer',
	TINYINT: 'integer',
	BYTEINT: 'integer',
	REAL: 'float',
	FLOAT: 'float',
	FLOAT4: 'float',
	FLOAT8: 'float',
	DOUBLE: 'float',
	'DOUBLE PRECISION': 'float',
	DECIMAL: 'float',
	NUMERIC: 'float',
	BOOLEAN: 'boolean',
	DATE: 'date',
	TIME: 'time',
	DATETIME: 'datetime',
	TIMESTAMP: 'datetime',
	TIMESTAMP_LTZ: 'datetime',
	TIMESTAMP_NTZ: 'datetime',
	TIMESTAMP_TZ: 'datetime',
	VARIANT: 'text',
	OBJECT: 'text',
	ARRAY: 'text',
};

export const getPGColumnBaseType = (type: any) => {
	if (!type || type?.includes('VARCHAR')) {
		return 'text';
	}

	return PG_COLUMN_BASE_TYPE[type];
};

export const generateSequentialName = ({ currentNames, prefix }: any) => {
	let nameIndex = 1;

	while (currentNames.includes(`${prefix}${nameIndex}`)) {
		nameIndex += 1;
	}

	const newName = `${prefix}${nameIndex}`;
	const newLabel = `${prefix.charAt(0).toUpperCase() + prefix.slice(1)}${nameIndex}`;

	return { name: newName, label: newLabel };
};

export const getErrorMessage = (error: any) => {
	if (error?.response?.data?.detail) {
		if (Array.isArray(error?.response?.data?.detail)) {
			return error?.response?.data?.detail.map((e: any) => e.msg).join(', ');
		}
	}

	if (Array.isArray(error?.response?.data?.result)) {
		return error?.response?.data?.result.join(', ');
	}

	const errorMessage =
		error?.response?.data?.error ||
		error?.response?.data?.message ||
		error?.response?.data?.result ||
		error?.response?.data?.detail?.message ||
		error?.response?.data?.detail?.error ||
		error?.response?.data?.detail ||
		error?.response?.data ||
		error?.message ||
		'';

	if (typeof errorMessage !== 'string') {
		return JSON.stringify(errorMessage);
	}

	return errorMessage;
};

export const isProductionApp = () => {
	return import.meta.env.VITE_APP_TYPE === 'app';
};

export const isFreeApp = () => {
	return !import.meta.env.VITE_APP_TYPE || import.meta.env.VITE_APP_TYPE === 'main-free';
};

export const invalidResourceName = (
	oldName: string,
	newName: string,
	names: any,
	mustBeLowercase = true,
) => {
	const notUnique = names.find((n: string) => n === newName && n !== oldName);

	if (newName !== newName.toLowerCase() && mustBeLowercase) {
		return 'Must be lowercase';
	}

	if (notUnique) {
		return 'Name already exists';
	}

	if (newName.includes(' ')) {
		return 'Name cannot have spaces';
	}

	if (newName !== '' && !Number.isNaN(parseInt(newName[0], 10))) {
		return 'Name cannot start with a number';
	}

	if (!newName.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/g) && newName !== '') {
		return 'Name contains invalid characters';
	}

	return false;
};

export const extractTemplateString = (value: any, state: any) => {
	try {
		const regex = /\{{(.*?)\}}/g;
		const matches = value?.matchAll(regex);

		let newInputString = value;

		[...matches].forEach((element) => {
			const [mainStr, underlyingTemplate] = element;

			const parsedValue = get(state, underlyingTemplate);

			/**
			 * If the template is just accesing values, we just get the parsed value
			 * instead of converting it to a string
			 *
			 * For eg: Default Values
			 */
			if (newInputString === mainStr) {
				newInputString = parsedValue;
			} else {
				newInputString = newInputString.replace(mainStr, parsedValue || '');
			}
		});

		return newInputString;
	} catch (e) {
		return value;
	}
};
