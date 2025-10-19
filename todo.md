- # Done

    ...

    - add : `cpoint` alias, refers to `u21`.

    - add : `isize` alias, refers to `i64`.

    - add : `usize` alias, refers to `u64`.

    - fix : `str` should be `slice`.

    - fix : `''` must be more smart to handle/accept `char(u8)` and `cpoint(u21)`.

- # Current


- # Later

    - add `bench` stmt (builtin-benchmark-framework).

    - add `std` lib.

    - currently, we handle `errset { x, y }` x and y as Ident, but what about TypeNode.asErr(span, "x") ?

    - impl meta/builtin `@..`

