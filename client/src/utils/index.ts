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
	const newLabel = `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${nameIndex}`;

	return { name: newName, label: newLabel };
};

export const getErrorMessage = (error: any) => {
	if (error?.response?.data?.detail) {
		if (Array.isArray(error?.response?.data?.detail)) {
			return error?.response?.data?.detail.map((e: any) => e.msg).join(', ');
		}
	}

	const errorMessage =
		error?.response?.data?.error ||
		error?.response?.data?.message ||
		error?.response?.data ||
		error?.message ||
		'';

	if (typeof errorMessage !== 'string') {
		return JSON.stringify(errorMessage);
	}

	return errorMessage;
};

export const isProductionApp = () => {
	return window.location.href.includes('app.dropbase.io');
};

export const invalidResourceName = (oldName: string, newName: string, names: any) => {
	const notUnique = names.find((n: string) => n === newName && n !== oldName);

	if (newName !== newName.toLowerCase()) {
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
