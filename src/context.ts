function _hasProperty(value: unknown, name: string): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && name in value
}

export function lookup(context: readonly unknown[], name: string): unknown {
  if (name === ".") {
    return context[0]
  }
  const parts = name.split(".")
  let value: unknown = context.find((view) => _hasProperty(view, parts[0]))
  for (const key of parts) {
    if (value !== null && value !== undefined) {
      value = Object(value)
    }
    if (!_hasProperty(value, key)) {
      return undefined
    }
    value = value[key]
  }
  return value
}
