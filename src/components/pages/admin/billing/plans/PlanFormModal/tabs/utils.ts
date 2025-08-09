export function toArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) {
    return value.filter(Boolean) as T[];
  }
  return value ? [value] : [];
}
