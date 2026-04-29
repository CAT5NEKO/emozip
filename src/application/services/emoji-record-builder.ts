import { buildFormattedNameFromFile } from "../../domain/emoji/emoji-name-formatter.ts";
import { generateAliasForName } from "../usecases/generate-alias.ts";
import type { AppSettings, EmojiRecord } from "../../shared/types/emoji.ts";

function generateRecordId(): string {
  return crypto.randomUUID();
}

export function buildEmojiRecordFromFile(file: File, settings: AppSettings): EmojiRecord {
  const formattedName = buildFormattedNameFromFile(file);
  const imagePreviewUrl = URL.createObjectURL(file);
  const aliases = generateAliasForName(formattedName, settings.aliasGeneration);

  return {
    id: generateRecordId(),
    fileName: file.name,
    formattedName,
    category: settings.commonCategory,
    aliases,
    isSensitive: false,
    localOnly: false,
    license: settings.commonLicense || null,
    imageFile: file,
    imagePreviewUrl,
  };
}

export async function buildEmojiRecordsFromFiles(
  files: File[],
  settings: AppSettings,
): Promise<EmojiRecord[]> {
  const records = files.map((file) => buildEmojiRecordFromFile(file, settings));
  return Promise.resolve(records);
}

export function revokeEmojiRecordPreviewUrl(record: EmojiRecord): void {
  if (!record.imagePreviewUrl) {
    return;
  }
  URL.revokeObjectURL(record.imagePreviewUrl);
}
