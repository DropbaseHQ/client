from server.controllers.task.base_source_column import SourceColumn

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

stripe_columns = {
    "product": {
        "id": stripe_product_id,
        "name": stripe_product_name,
        "default_price": stripe_product_default_price,
    }
}
