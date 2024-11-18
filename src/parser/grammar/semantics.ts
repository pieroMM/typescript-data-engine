import grammar, {QuerySemantics} from "./queryLanguage.ohm-bundle";

export const semantics: QuerySemantics = grammar.createSemantics().addOperation("eval", {
    String(_, value, __) {
        return value.sourceString;
    },

    Number_fract(integer, point, decimal) {
        return +(integer.sourceString + point.sourceString + decimal.sourceString);
    },

    Number_whole(value) {
        return +(value.sourceString);
    },

    columnName(_) {
        return this.sourceString;
    },

    Columns(columns) {
        return columns.asIteration().children.map(child => child.eval());
    },

    Project(_, columns) {
        return columns.eval()
    },

    Filter(_, predicate) {
        return predicate.eval()
    },

    FilterPredicate_ltString(columnName, _, value) {
        return {
            comparator: "lt",
            columnName: columnName.eval(),
            value: value.eval()
        }
    },

    FilterPredicate_ltNumber(columnName, _, value) {
        return {
            comparator: "lt",
            columnName: columnName.eval(),
            value: value.eval()
        }
    },

    FilterPredicate_gtString(columnName, _, value) {
        return {
            comparator: "gt",
            columnName: columnName.eval(),
            value: value.eval()
        }
    },

    FilterPredicate_gtNumber(columnName, _, value) {
        return {
            comparator: "gt",
            columnName: columnName.eval(),
            value: value.eval()
        }
    },

    FilterPredicate_eqString(columnName, _, value) {
        return {
            comparator: "eq",
            columnName: columnName.eval(),
            value: value.eval()
        }
    },

    FilterPredicate_eqNumber(columnName, _, value) {
        return {
            comparator: "eq",
            columnName: columnName.eval(),
            value: value.eval()
        }
    },

    Query_complete(project, filter) {
        return {
            project: project.eval(),
            filter: filter.eval()
        }
    },

    Query_projectOnly(project) {
        return {
            project: project.eval()
        }
    },

    Query_filterOnly(filter) {
        return {
            filter: filter.eval()
        }
    }
});
