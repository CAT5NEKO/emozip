import { toHiragana, isRomaji } from "wanakana";
import type { AliasGenerationSettings } from "../../shared/types/emoji.ts";

export function generateAliasForName(name: string, settings: AliasGenerationSettings): string[] {
  if (!settings.enabled) {
    return [];
  }

  const cleanName = name.replace(/[_-]/g, " ").trim();
  if (!cleanName) {
    return [];
  }

  if (isRomaji(cleanName)) {
    const hiragana = toHiragana(cleanName);
    if (hiragana !== cleanName) {
      return [hiragana];
    }
  }

  return [];
}
