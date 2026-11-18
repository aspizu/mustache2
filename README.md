# mustache2

The Mustache templates you know, with less JavaScript to ship.

This project is vibecoded.

> Logic-less templates.
>
> [Mustache](https://mustache.github.io/)

## Smaller download

Compared with the published Mustache.js 4.2.0 bundle, mustache2 is about 68%
smaller with either gzip or Brotli. Applying the same minifier to both libraries
puts the compressed size difference at about 60%.

| Library                          | Minified |    gzip |  Brotli |
| -------------------------------- | -------: | ------: | ------: |
| mustache2                        |  1,950 B | 1,064 B |   973 B |
| Mustache.js 4.2.0, published     | 11,790 B | 3,361 B | 3,032 B |
| Mustache.js 4.2.0, same minifier |  6,492 B | 2,652 B | 2,403 B |

Measured with gzip level 9 and Brotli quality 11.

## Performance

Mustache.js 4.2.0 rendered repeated templates 2.1 to 4.2 times faster with its
default cache in five local benchmarks. With caching disabled, mustache2 was
faster at interpolation, HTML escaping, and partials; Mustache.js still won on
lists and nested data. Measured on Apple M5 with Node.js 26.13.0, using equally
minified builds and the median of nine warmed samples per case.

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
