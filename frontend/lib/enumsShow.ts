type EnumMap = Record<string, { value: string; label: string }[]>;

export function enumsShow(enums: EnumMap, category: string, value: string): string {
  return enums[category]?.find((e) => e.value === value)?.label || value;
}
