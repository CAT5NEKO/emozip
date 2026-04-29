import type { EmojiRecord, MetaJsonEmoji } from "../../shared/types/emoji.ts";

export function convertToMetaJsonEmoji(record: EmojiRecord): MetaJsonEmoji {
  const extension = extractExtension(record.fileName);
  const fileNameInZip = `${record.formattedName}${extension}`;

  const emojiData: MetaJsonEmoji["emoji"] = {
    name: record.formattedName,
    category: record.category,
    aliases: record.aliases,
    license: record.license || "",
  };

  if (record.isSensitive) {
    emojiData.isSensitive = true;
  }

  if (record.localOnly) {
    emojiData.localOnly = true;
  }

  return {
    downloaded: true,
    fileName: fileNameInZip,
    emoji: emojiData,
  };
}

function extractExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  return fileName.slice(lastDotIndex);
}
