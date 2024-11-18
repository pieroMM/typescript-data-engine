import {describe, it} from "node:test";
import assert from "node:assert";
import grammar from "../queryLanguage.ohm-bundle";
import {semantics} from "../semantics";


describe("Test query parser and semantics", () => {
    it("Test parser", () => {
        const query1 = "PROJECT";
        assert(grammar.match(query1).succeeded());

        const query2 = "PROJECT col1";
        assert(grammar.match(query2).succeeded());

        const query3 = "PROJECT col1, col2";
        assert(grammar.match(query3).succeeded());

        const query4 = "PROJECT col1, col2, col3";
        assert(grammar.match(query4).succeeded());

        const query5 = "PROJECT col1, col2, col3, col3";
        assert(grammar.match(query5).succeeded());

        const query6 = "FILTER";
        assert(!grammar.match(query6).succeeded());

        const query7 = "FILTER col1 = 0";
        assert(grammar.match(query7).succeeded());

        const query8 = "FILTER col1 > 0";
        assert(grammar.match(query8).succeeded());

        const query9 = "FILTER col1 < 0";
        assert(grammar.match(query9).succeeded());

        const query10 = "FILTER col1 = \"ABC\"";
        assert(grammar.match(query10).succeeded());

        const query11 = "FILTER col1 > \"ABC\"";
        assert(grammar.match(query11).succeeded());

        const query12 = "FILTER col1 < \"ABC\"";
        assert(grammar.match(query12).succeeded());

        const query13 = "PROJECT col1, col2, col3 FILTER col1 = \"ABC\"";
        assert(grammar.match(query13).succeeded());

        const query14 = "PROJECT col1, col2, col3 FILTER col1 = 10";
        assert(grammar.match(query14).succeeded());

        const query15 = "PROJECT col1, col2, col3 FILTER col1 = 10.0";
        assert(grammar.match(query15).succeeded());
    });
    it('Test semantics', () => {
        const query1 = "PROJECT col1, col2, col3 FILTER col1 = \"ABC\"";
        const matcher1 = grammar.match(query1);
        const semantics1 = semantics(matcher1).eval();
        assert(semantics1);
        assert.deepEqual(semantics1.project.join(","), "col1,col2,col3");
        assert(semantics1.filter);
        assert.deepEqual(semantics1.filter.comparator, "eq");
        assert.deepEqual(semantics1.filter.columnName, "col1");
        assert.deepEqual(semantics1.filter.value, "ABC");

        const query2= "PROJECT col1, col2, col3 FILTER col1 > \"ABC\"";
        const matcher2 = grammar.match(query2);
        const semantics2 = semantics(matcher2).eval();
        assert(semantics2);
        assert.deepEqual(semantics2.project.join(","), "col1,col2,col3");
        assert(semantics1.filter);
        assert.deepEqual(semantics2.filter.comparator, "gt");
        assert.deepEqual(semantics2.filter.columnName, "col1");
        assert.deepEqual(semantics2.filter.value, "ABC");

        const query3 = "PROJECT col1, col2, col3 FILTER col1 < \"ABC\"";
        const matcher3 = grammar.match(query3);
        const semantics3 = semantics(matcher3).eval();
        assert(semantics3);
        assert.deepEqual(semantics3.project.join(","), "col1,col2,col3");
        assert(semantics1.filter);
        assert.deepEqual(semantics3.filter.comparator, "lt");
        assert.deepEqual(semantics3.filter.columnName, "col1");
        assert.deepEqual(semantics3.filter.value, "ABC");

        const query4 = "PROJECT col1, col2, col3 FILTER col1 = 10";
        const matcher4 = grammar.match(query4);
        const semantics4 = semantics(matcher4).eval();
        assert(semantics4);
        assert.deepEqual(semantics4.project.join(","), "col1,col2,col3");
        assert(semantics4.filter);
        assert.deepEqual(semantics4.filter.comparator, "eq");
        assert.deepEqual(semantics4.filter.columnName, "col1");
        assert.deepEqual(semantics4.filter.value, 10);

        const query5 = "PROJECT col1, col2, col3 FILTER col1 > 10";
        const matcher5 = grammar.match(query5);
        const semantics5 = semantics(matcher5).eval();
        assert(semantics5);
        assert.deepEqual(semantics5.project.join(","), "col1,col2,col3");
        assert(semantics5.filter);
        assert.deepEqual(semantics5.filter.comparator, "gt");
        assert.deepEqual(semantics5.filter.columnName, "col1");
        assert.deepEqual(semantics5.filter.value, 10);

        const query6 = "PROJECT col1, col2, col3 FILTER col1 < 10";
        const matcher6 = grammar.match(query6);
        const semantics6 = semantics(matcher6).eval();
        assert(semantics6);
        assert.deepEqual(semantics6.project.join(","), "col1,col2,col3");
        assert(semantics6.filter);
        assert.deepEqual(semantics6.filter.comparator, "lt");
        assert.deepEqual(semantics6.filter.columnName, "col1");
        assert.deepEqual(semantics6.filter.value, 10);

        const query7 = "PROJECT col1, col2, col3"
        const matcher7 = grammar.match(query7);
        const semantics7 = semantics(matcher7).eval();
        assert(semantics7);
        assert.deepEqual(semantics7.project.join(","), "col1,col2,col3");

        const query8 = "FILTER col1 = 10";
        const matcher8 = grammar.match(query8);
        const semantics8 = semantics(matcher8).eval();
        assert(semantics8.filter);
        assert.deepEqual(semantics8.filter.comparator, "eq");
        assert.deepEqual(semantics8.filter.columnName, "col1");
        assert.deepEqual(semantics8.filter.value, 10);
    });
});
