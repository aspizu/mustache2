import {lookup} from "./context.js"
import {parse, type Token} from "./parse.js"

type Partials =
  | Readonly<Record<string, string>>
  | ((name: string) => string | undefined)

const _entities: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
}

export function render(template: string, view: unknown, partials?: Partials): string {
  if (typeof template !== "string") {
    throw new TypeError("Template must be a string")
  }

  function _renderTokens(tokens: Token[], context: readonly unknown[]): string {
    return tokens
      .map((token) => {
        if (token.type === "text") {
          return token.value
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
            parse(partial.replace(/^(?=.)/gm, () => token.indent)),
            context,
          )
        }
        const value = lookup(context, token.value)
        if (token.type === "name" || token.type === "&") {
          let text = String(value)
          if (value === null || value === undefined) {
            text = ""
          }
          return token.type === "&"
            ? text
            : text.replace(/[&<>"'`=/]/g, (char) => _entities[char])
        }
        const falsey = !value || (Array.isArray(value) && value.length === 0)
        if (token.type === "^") {
          return falsey ? _renderTokens(token.children, context) : ""
        }
        if (falsey) {
          return ""
        }
        return Array.from(Array.isArray(value) ? value : [value], (item) =>
          _renderTokens(token.children, value === true ? context : [item, ...context]),
        ).join("")
      })
      .join("")
  }

  return _renderTokens(parse(template), [view])
}
