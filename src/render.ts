import {parse, TokenKind, type Token} from "./parse.js"

type Partials =
  | Readonly<Record<string, string>>
  | ((name: string) => string | undefined)

const _escapeCharacters = "&<>\"'`=/"
const _entities = "&amp; &lt; &gt; &quot; &#39; &#x60; &#x3D; &#x2F;".split(" ")

function _hasProperty(value: unknown, name: string): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && name in value
}

export function render(template: string, view: unknown, partials?: Partials): string {
  if (typeof template !== "string") {
    throw new TypeError("Expected string")
  }

  function _renderTokens(tokens: Token[], context: readonly unknown[]): string {
    return tokens
      .map((token) => {
        if (token.type === TokenKind.Text) {
          return token.line.standalone ? "" : token.value
        }
        if (token.type === ">") {
          let partial: string | undefined
          if (typeof partials === "function") {
            partial = partials(token.value)
          } else if (partials && Object.hasOwn(partials, token.value)) {
            partial = partials[token.value]
          }
          if (partial === undefined) {
            return ""
          }
          return _renderTokens(
            parse(
              partial.replace(/^(?=.)/gm, token.line.standalone ? token.indent : ""),
            ),
            context,
          )
        }
        let value = context[0]
        if (token.value !== ".") {
          const parts = token.value.split(".")
          value = context.find((view) => _hasProperty(view, parts[0]))
          for (const key of parts) {
            if (value !== null && value !== undefined) {
              value = Object(value)
            }
            if (!_hasProperty(value, key)) {
              value = undefined
              break
            }
            value = value[key]
          }
        }
        if (!token.type || token.type === "&") {
          const text = String(value ?? "")
          return token.type
            ? text
            : text.replace(
                /[&<>"'`=/]/g,
                (char) => _entities[_escapeCharacters.indexOf(char)],
              )
        }
        const items = Array.isArray(value) ? value : [value]
        if (!value || items.length === 0) {
          return token.type === "^" ? _renderTokens(token.children, context) : ""
        }
        if (token.type === "^") {
          return ""
        }
        return Array.from(items, (item) =>
          _renderTokens(token.children, value === true ? context : [item, ...context]),
        ).join("")
      })
      .join("")
  }

  return _renderTokens(parse(template), [view])
}
