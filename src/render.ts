import {lookup} from "./context.js"
import {parse, TokenKind, type Token} from "./parse.js"

type Partials =
  | Readonly<Record<string, string>>
  | ((name: string) => string | undefined)

const _escapeCharacters = "&<>\"'`=/"
const _entities = [
  "&amp;",
  "&lt;",
  "&gt;",
  "&quot;",
  "&#39;",
  "&#x60;",
  "&#x3D;",
  "&#x2F;",
]

export function render(template: string, view: unknown, partials?: Partials): string {
  if (typeof template !== "string") {
    throw new TypeError("Template must be a string")
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
        const value = lookup(context, token.value)
        if (token.type === TokenKind.Name || token.type === "&") {
          const printable: unknown = value ?? ""
          const text = String(printable)
          return token.type === "&"
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
