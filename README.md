# Fastify "can't resolve reference" error repro, from 4.2.0 onwards

## Description:
Using **both `Type.Union()` and `Type.Ref()`** in a schema at the same time,
```plaintext
ERROR: can't resolve reference (...) from id (...)
```
is thrown at runtime, on request, with no schema error on startup.

Using **just one of `Type.Union()` or `Type.Ref()` without the other** in a schema results in no error.

---

## Test:

- `npm install`

With any `fastify` version from `@4.2.0` to `@4.9.2` (latest as of now):
- run `npm start`
- open http://localhost:3370/documentation
- on `/fails1` operation, click `Try it out`, then `Execute`, which should result in
```JSON
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "can't resolve reference RefSchema from id FailingSchema1"
}
```
 - `/works1` and `/works2` operations both resolve properly
   - `/works1` shows that `Type.Union()` does work next to a non-`Type.Ref()` property
   - `/works2` shows that the `Type.Ref()` can actually be resolved, even next to some other typebox-provided utility, `Type.Array()` in this case
 - `/fails2` is the same as `/works2` except it uses `Type.Union()` inside `Type.Array()`, causing the same kind of error as in `/fails1`

---

## Version notes:
Happens from `fastify@4.2.0` onwards.

Last version before that is `4.1.0`:

- Install that exact version (via `-E`) with
```
npm install fastify@4.1.0 -E
```
- run `npm start`
- open http://localhost:3370/documentation
- on `/fails1` operation, click `Try it out`, then `Execute`, and it resolves properly with
```JSON
{
  "id": 1,
  "reference": "hi"
}
```
- as expected `/fails2` resolves properly as well