- # Done

    ...

    - add : array type length member, e.g. `let name = "Maysara"; let len = name.len;`

    - add : tuple type length member and member access via array syntax, e.g. `let t = . { x,y,z };` then `t.len` and `t[0]`.

    - add : slice concatenation, e.g. `let name = "Maysara"; let greeting = "Hello" + " " + name;`

    - add : slice by range, e.g. `let name = "Maysara"; let my_slice = name[0..1]; // "Ma"`

    - fix : type `type` must accept any type.

    - change : `switch` to `match` and `case x :` to `x =>`

    - fix : `union`/`struct`/`enum`/`fn` types.

- # Current

- # Later

    - add `bench` stmt (builtin-benchmark-framework).

    - add `std` lib.

    - impl meta/builtin `@..`