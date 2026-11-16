# Vendored Mustache tests

These are upstream snapshots for compatibility testing. Keep the copied files
unchanged when updating them and retain each project's license.

## Mustache.js

- Source: <https://github.com/janl/mustache.js>
- Revision: `972fd2b27a036888acfcb60d6119317744fac7ee`
- Copied: `test/`, `spec/_files/`, and `LICENSE` into `mustache.js/`.
- License: [MIT](mustache.js/LICENSE).

The `test/` directory includes the unit tests, rendering fixtures, CLI tests,
module-system tests, and browser test helpers. `spec/_files/` contains additional
upstream fixtures.

The `test/spec` Git submodule is not copied here. Its pinned upstream revision is
`72233f3ffda9e33915fd3022d0a9ebbcce265acd`; the newer shared specification is
vendored separately below.

## Mustache specification

- Source: <https://github.com/mustache/spec>
- Revision: `e8ec001db7f594521e773c34866aca2b5d6b0037`
- Copied: `specs/`, `README.md`, `TESTING.md`, and `LICENSE` into `mustache-spec/`.
- License: [MIT](mustache-spec/LICENSE).

The specification includes YAML and JSON cases. See the upstream
[testing instructions](mustache-spec/TESTING.md) for their format. Files beginning
with `~` cover optional features.

## Integration

These snapshots are not connected to a local test runner yet. The Mustache.js
harness expects Mocha, Chai, its upstream implementation, package metadata, CLI,
and module builds at their original relative paths. Its specification test reads
`test/spec/specs`; the separately vendored specification lives at
`vendor/mustache-spec/specs`.

When adding a local runner, point it at the local implementation and these
fixtures. Review the upstream specification runner's skip list before reusing it;
it skips cases unsupported by Mustache.js. The newer specification also includes
optional features that its pinned version did not contain.

Formatting and linting exclude `vendor/` to preserve fixture whitespace and
upstream source files.
