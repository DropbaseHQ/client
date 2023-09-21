import ast


class FunctionVisitor(ast.NodeVisitor):
    def __init__(self):
        self.functions = {}

    def visit_FunctionDef(self, node):
        if isinstance(node.returns, ast.Name) and node.returns.id == "State":
            arguments = [arg.arg for arg in node.args.args]
            arg_annotations = [
                arg.annotation.id if isinstance(arg.annotation, ast.Name) else ""
                for arg in node.args.args
            ]
            if all(arg in ["UserInput", "Table", "State"] for arg in arg_annotations):
                self.functions[node.name] = {"arguments": arguments, "arg_annotations": arg_annotations}
            if all(arg in ["user_input", "table", "state"] for arg in arguments):
                self.functions[node.name] = {"arguments": arguments, "arg_annotations": arg_annotations}


def get_function_names(python_string):
    visitor = FunctionVisitor()
    visitor.visit(ast.parse(python_string))
    return visitor.functions
