function _hasProperty(value: unknown, name: string): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && name in value
}

function _property(value: unknown, name: string): unknown {
  if (value === null || value === undefined) {
    return undefined
  }
  const object: unknown = Object(value)
  if (_hasProperty(object, name)) {
    return object[name]
  }
  return undefined
}

export function lookup(context: readonly unknown[], name: string): unknown {
  if (name === ".") {
    return context[0]
  }
  const parts = name.split(".")
  return parts.reduce(
    _property,
    context.find((view) => _hasProperty(view, parts[0])),
  )
}
