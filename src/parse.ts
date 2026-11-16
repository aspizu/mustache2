type TagType = "name" | "&" | "!" | "=" | "#" | "^" | "/" | ">"

type Tag = {
  [Type in TagType]: {
    type: Type
    value: string
    indent: string
  }
}[TagType]

interface Text {
  type: "text"
  value: string
}

type Section = Extract<Tag, {type: "#" | "^"}> & {
  children: Token[]
}

export type Token = Text | Extract<Tag, {type: "name" | "&" | ">"}> | Section

function _delimiters(value: string, start: number): string[] {
  if (!value.endsWith("=")) {
    throw new Error(`Invalid tags at ${start}`)
  }
  value = value.slice(0, -1).trim()
  const delimiters = value.split(/\s+/)
  if (delimiters.length !== 2 || delimiters.some((delimiter) => !delimiter)) {
    throw new Error(`Invalid tags: ${value}`)
  }
  return delimiters
}

function _stripLine(line: (Tag | Text)[]): void {
  const hasTag = line.some((token) => token.type !== "text")
  const hasContent = line.some((token) =>
    token.type === "text"
      ? /\S/.test(token.value)
      : token.type === "name" || token.type === "&",
  )
  if (!hasTag || hasContent) return
  let indent = ""
  for (const token of line) {
    if (token.type === "text") {
      indent += token.value.replace(/[\r\n]/g, "")
      token.value = ""
    } else if (token.type === ">") {
      token.indent = indent
    }
  }
}

export function parse(template: string): Token[] {
  const root: Token[] = []
  const stack: Section[] = []
  let tokens = root
  let line: (Tag | Text)[] = []
  let open = "{{"
  let close = "}}"
  let position = 0

  function _appendText(end: number): void {
    for (const value of template.slice(position, end).match(/[^\n]*\n|[^\n]+/g) ?? []) {
      const token: Text = {type: "text", value}
      tokens.push(token)
      line.push(token)
      if (value.endsWith("\n")) {
        _stripLine(line)
        line = []
      }
    }
    position = end
  }

  while (position < template.length) {
    const start = template.indexOf(open, position)
    if (start === -1) {
      _appendText(template.length)
      break
    }
    _appendText(start)
    const contentStart = start + open.length
    const match = template.slice(contentStart).match(/^\s*([#^/>&!={])?/)!
    const marker = match[1] as TagType | "{" | undefined
    const content = contentStart + match[0].length
    const closing = marker === "{" ? `}${close}` : close
    const end = template.indexOf(closing, content)
    if (end === -1) {
      throw new Error(`Unclosed tag at ${template.length}`)
    }
    const value = template.slice(content, end).trim()
    const type = marker === "{" ? "&" : (marker ?? "name")
    if (!value && type !== "!" && type !== "=") {
      throw new Error(`Empty tag name at ${start}`)
    }
    const token: Tag = {type, value, indent: ""}
    line.push(token)
    position = end + closing.length
    switch (token.type) {
      case "#":
      case "^": {
        const section: Section = {
          ...token,
          children: [],
        }
        tokens.push(section)
        stack.push(section)
        tokens = section.children
        break
      }
      case "/": {
        const section = stack.pop()
        if (!section) {
          throw new Error(`Unopened section "${token.value}" at ${start}`)
        }
        if (section.value !== token.value) {
          throw new Error(`Unclosed section "${section.value}" at ${start}`)
        }
        tokens = stack.at(-1)?.children ?? root
        break
      }
      case "=": {
        ;[open, close] = _delimiters(token.value, start)
        break
      }
      case "!": {
        break
      }
      default: {
        tokens.push(token)
      }
    }
  }

  _stripLine(line)
  const unclosed = stack.at(-1)
  if (unclosed) {
    throw new Error(`Unclosed section "${unclosed.value}" at ${template.length}`)
  }
  return root
}
