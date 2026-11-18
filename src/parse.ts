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

interface TagPrefix {
  0: string
  1?: TokenKind.Name | "&" | "!" | "=" | "#" | "^" | "/" | ">" | "{"
}

interface SectionFrame {
  value?: string
  children: Token[]
  parent: SectionFrame | null
}

function _error(message: string, position: number): never {
  throw new Error(`${message} at ${position}`)
}

function _delimiters(value: string, start: number): string[] {
  if (!value.endsWith("=")) {
    _error("Invalid tags", start)
  }
  value = value.slice(0, -1).trim()
  const delimiters = value.split(/\s+/)
  if (delimiters.length !== 2) {
    throw new Error(`Invalid tags: ${value}`)
  }
  return delimiters
}

export function parse(template: string): Token[] {
  const length = template.length
  let frame: SectionFrame = {children: [], parent: null}
  let line: Line = {standalone: null}
  let indent = ""
  let open = "{{"
  let close = "}}"
  let position = 0

  function _unclosedSection(at: number): never {
    _error(`Unclosed section "${frame.value}"`, at)
  }

  function _appendText(text: string): void {
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
  }

  let start: number
  while ((start = template.indexOf(open, position)) >= 0) {
    _appendText(template.slice(position, start))
    const contentStart = start + open.length
    const prefix: TagPrefix = template.slice(contentStart).match(/^\s*([#^/>&!={]?)/)!
    let type = prefix[1]!
    const content = contentStart + prefix[0].length
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
    line.standalone =
      line.standalone !== false && type !== TokenKind.Name && type !== "&"
    position = end + closing.length
    if (type === "=") {
      ;[open, close] = _delimiters(value, start)
      continue
    }
    if (type === "!") continue
    if (!value) {
      _error("Empty tag name", start)
    }
    if (type === "#" || type === "^") {
      const children: Token[] = []
      frame.children.push({type, value, children})
      frame = {value, children, parent: frame}
    } else if (type === "/") {
      if (!frame.parent) {
        _error(`Unopened section "${value}"`, start)
      }
      if (frame.value !== value) {
        _unclosedSection(start)
      }
      frame = frame.parent
    } else {
      frame.children.push({type, value, indent, line})
    }
  }

  _appendText(template.slice(position))
  if (frame.parent) {
    _unclosedSection(length)
  }
  return frame.children
}
