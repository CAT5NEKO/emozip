import { toRomaji } from "wanakana";

const ALLOWED_CHAR_PATTERN = /[^a-z0-9_]/g;
const MULTIPLE_UNDERSCORE_PATTERN = /_+/g;
const LEADING_TRAILING_UNDERSCORE_PATTERN = /^_+|_+$/g;

export function stripFileExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

export function formatToMisskeyEmojiName(rawName: string): string {
  const romanized = toRomaji(rawName);
  const lowercased = romanized.toLowerCase();
  const spacesReplaced = lowercased.replace(/[\s\-．。、・]/g, "_");
  const asciiOnly = spacesReplaced.replace(ALLOWED_CHAR_PATTERN, "");
  const normalized = asciiOnly.replace(MULTIPLE_UNDERSCORE_PATTERN, "_");
  return normalized.replace(LEADING_TRAILING_UNDERSCORE_PATTERN, "");
}

export function buildFormattedNameFromFile(file: File): string {
  const baseName = stripFileExtension(file.name);
  return formatToMisskeyEmojiName(baseName);
}
