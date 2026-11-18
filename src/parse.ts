export const enum TokenKind {
  Text,
  Name = "",
}

interface Line {
  standalone: boolean | null
}

export type Token =
  | {type: TokenKind.Text; value: string; line: Line}
  | {type: TokenKind.Name; value: string}
  | {type: "&"; value: string}
  | {type: ">"; value: string; indent: string; line: Line}
  | {type: "#" | "^"; value: string; children: Token[]}

type TagType = TokenKind.Name | "&" | "!" | "=" | "#" | "^" | "/" | ">" | "{"

interface SectionFrame {
  value?: string
  children: Token[]
  parent: SectionFrame | null
}

function _error(message: string, position: number): never {
  throw new Error(`${message} @${position}`)
}

export const parse = (template: string): Token[] => {
  const length = template.length
  let frame: SectionFrame = {children: [], parent: null}
  let line: Line = {standalone: null}
  let indent = ""
  let open = "{{"
  let close = "}}"
  let position = 0

  while (position < length) {
    const start = template.indexOf(open, position)
    const text = template.slice(position, start < 0 ? length : start)
    text.match(/[^\n]+\n?|\n/g)?.forEach((value) => {
      frame.children.push({type: TokenKind.Text, value, line})
      if (/\S/.test(value)) {
        line.standalone = false
      } else {
        indent += value.replace(/\r/g, "")
      }
      if (/\n/.test(value)) {
        line = {standalone: null}
        indent = ""
      }
    })
    if (start < 0) break
    const contentStart = start + open.length
    let [prefix, type] = template.slice(contentStart).match(/^\s*([#^/>&!={]?)/) as [
      string,
      TagType,
    ]
    const content = contentStart + prefix.length
    let closing = close
    if (type === "{") {
      type = "&"
      closing = `}${close}`
    }
    const end = template.indexOf(closing, content)
    if (end < 0) {
      _error("Unclosed tag", length)
    }
    const value = template.slice(content, end).trim()
    line.standalone = line.standalone !== false && !!type && type !== "&"
    position = end + closing.length
    if (type === "=") {
      ;[, open, close] = value.match(/^(\S+)\s+(\S+)\s*=$/) ?? _error("Bad tags", start)
      continue
    }
    if (type === "!") continue
    if (!value) {
      _error("Empty tag", start)
    }
    if (type === "#" || type === "^") {
      const children: Token[] = []
      frame.children.push({type, value, children})
      frame = {value, children, parent: frame}
    } else if (type === "/") {
      if (!frame.parent) {
        _error(`Unexpected /${value}`, start)
      }
      if (frame.value !== value) {
        _error(`Unclosed ${frame.value}`, start)
      }
      frame = frame.parent
    } else {
      frame.children.push({type, value, indent, line})
    }
  }

  if (frame.parent) {
    _error(`Unclosed ${frame.value}`, length)
  }
  return frame.children
}
