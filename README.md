# mustache2

The Mustache templates you know, with less JavaScript to ship.

This project is vibecoded.

> Logic-less templates.
>
> [Mustache](https://mustache.github.io/)

## Smaller download

mustache2 is about 64% smaller compressed than the published Mustache.js 4.2.0
bundle. Even when Mustache.js gets the same minification, mustache2 is about
55% smaller compressed.

| Library                          | Minified |    gzip |  Brotli |
| -------------------------------- | -------: | ------: | ------: |
| mustache2                        |  2,374 B | 1,197 B | 1,085 B |
| Mustache.js 4.2.0, published     | 11,790 B | 3,361 B | 3,032 B |
| Mustache.js 4.2.0, same minifier |  6,492 B | 2,652 B | 2,403 B |

Measured with gzip level 9 and Brotli quality 11.

## Familiar templates

Keep your variables, sections, inverted sections, partials, comments, dotted
names, and delimiter changes. HTML escaping, parent contexts, and standalone
whitespace handling are supported too. All 136 core Mustache specification
cases pass.

Works in browsers and Node.js, includes TypeScript types, and has no runtime
dependencies.

## Is it a fit?

If you use Mustache's core template features and want a smaller download,
mustache2 is worth considering. Lambdas, dynamic partial names, and template
inheritance are not supported. It is not a full replacement for every
Mustache.js API.
