- # Done

    - add `defer` stmt.

    - add `anyerror` type.

    - add `throw` stmt.

    - add better return/throw context, for example what if func not have return stmt, but have throw stmt will execute always ?

    - refactor visibility/mutability interface.

    - change `error { }` to `errset { }`

    - change `anyerror` to `err`

    - add/fix visibility guards.

    - add/fix self access/usage

    - fix Type parser rules to use new primitive type `paren` instead of direct handling.

    - add typeof/sizeof expr (we have '@typeof(..), ..')

    - add `comptime` attr to let/fn/param/field.

    - change tuple syntax from `()` to `.{}`.

    - in use `use x. as ..` must report error `ident requierd after .`

    - in expr `sizeof non-type-expr` must report error `type-expr requierd after sizeof`

    - add type(expr) for cast (we have 'expr as type').

    - evaluate standalone expression stmts too.

    - add `use * as x` -> `*` = `all exported stmts` as new object, e.g. `ModuleExports { symbols ..}`.

    - change `und` type to `und_t` , the expr is `und`.

    - change `null` type to `null_t` , the expr is `null`.

    - add `test` stmt (builtin-test-framework).

- # Current

    - add `project` lib with better caching for lsp.

- # Later

    - add `bench` stmt (builtin-benchmark-framework).

    - add `std` lib.

    - currently, we handle `errset { x, y }` x and y as Ident, but what about TypeNode.asErr(span, "x") ?

    - impl meta/builtin `@..`

