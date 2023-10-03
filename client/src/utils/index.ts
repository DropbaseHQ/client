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
