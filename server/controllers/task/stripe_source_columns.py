from server.controllers.task.base_source_column import SourceColumn
from server.controllers.task.source_column_helper import update_column_meta_with_filters

stripe_product_id = SourceColumn(
    name="id",
    type="text",
    primary_key=True,
    foreign_key=False,
    default=None,
    nullable=False,
    unique=True,
    create_required=True,
    modify_required=True,
    keylike=True,
    # table display specific
    editable=False,
    visible=True,
)


stripe_product_name = SourceColumn(
    name="name",
    type="text",
    primary_key=False,
    foreign_key=False,
    default=None,
    nullable=True,
    unique=False,
    create_required=True,
    modify_required=False,
    keylike=False,
    # table display specific
    editable=True,
    visible=True,
)

stripe_product_default_price = SourceColumn(
    name="default_price",
    type="text",
    primary_key=False,
    foreign_key=False,
    default=None,
    nullable=True,
    unique=False,
    create_required=False,
    modify_required=False,
    keylike=False,
    # table display specific
    editable=True,
    visible=True,
)


stripe_customer_id = SourceColumn(
    name="id",
    type="text",
    primary_key=True,
    foreign_key=False,
    default=None,
    nullable=False,
    unique=True,
    create_required=True,
    modify_required=True,
    keylike=True,
    # table display specific
    editable=False,
    visible=True,
)

stripe_customer_name = SourceColumn(
    name="name",
    type="text",
    primary_key=False,
    foreign_key=False,
    default=None,
    nullable=True,
    unique=False,
    create_required=True,
    modify_required=False,
    keylike=False,
    # table display specific
    editable=True,
    visible=True,
)


stripe_customer_email = SourceColumn(
    name="email",
    type="text",
    primary_key=False,
    foreign_key=False,
    default=None,
    nullable=True,
    unique=False,
    create_required=True,
    modify_required=False,
    keylike=False,
    # table display specific
    editable=True,
    visible=True,
)

stripe_customer_created = SourceColumn(
    name="created",
    type="text",
    primary_key=False,
    foreign_key=False,
    default=None,
    nullable=True,
    unique=False,
    create_required=True,
    modify_required=False,
    keylike=False,
    # table display specific
    editable=True,
    visible=True,
)


stripe_columns = {
    "product": {
        "id": stripe_product_id,
        "name": stripe_product_name,
        "default_price": stripe_product_default_price,
    },
    "customer": {
        "id": stripe_customer_id,
        "name": stripe_customer_name,
        "email": stripe_customer_email,
        "created": stripe_customer_created,
    },
}


def parse_stripe_column_model(regrouped_schema: dict, schema: str, table: str, new_schema: dict):
    for column in regrouped_schema[schema][table].keys():
        source_column = stripe_columns[table][column]
        filters = regrouped_schema[schema][table][column]["filters"]
        if len(filters) > 0:
            source_column = update_column_meta_with_filters(source_column, filters)
        new_schema[schema][table][column] = source_column.dict()
    return new_schema
