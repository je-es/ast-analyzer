- # Done

    ...

    - add : `cpoint` alias, refers to `u21`.

    - add : `isize` alias, refers to `i64`.

    - add : `usize` alias, refers to `u64`.

    - fix : `str` should be `slice`.

    - fix : `''` must be more smart to handle/accept `char(u8)` and `cpoint(u21)`.

    - fix : improve error types and throw mechanism.

    - fix : in function symbol metadata, add error type mode.

    - add : `selferr`

    - fix : [BUG] "TYPE_MISMATCH" "Float literals not allowed in integer-only context" in `let opt_float: ?f32 = 3.14;`

    - fix : [BUG] comptime handling, example: `comptime fn get_size() -> i32 { return 10; } let arr: [get_size()]i32;`

    - fix : [BUG] static must be immutable

    - a lot of bugs related to : `static`, `mut`, `optional`, `pointers`, `diag manager filter`, ... fixed.

- # Current

- # Later

    - add `bench` stmt (builtin-benchmark-framework).

    - add `std` lib.

    - impl meta/builtin `@..`