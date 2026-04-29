import type { EmojiRecord, MetaJson } from "../../shared/types/emoji.ts";
import type { ZipExporterDriver } from "../../domain/zip/zip-exporter-driver.ts";
import { convertToMetaJsonEmoji } from "../../domain/emoji/emoji-domain-service.ts";

function getExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return fileName.slice(lastDotIndex);
}

function buildMetaJson(records: EmojiRecord[]): MetaJson {
  return {
    emojis: records.map(convertToMetaJsonEmoji),
  };
}

export async function exportSelectedRecordsAsZip(
  records: EmojiRecord[],
  zipExporter: ZipExporterDriver,
): Promise<Blob> {
  const metaJson = buildMetaJson(records);

  const imageFiles = new Map<string, File>(
    records.map((record) => [
      `${record.formattedName}${getExtension(record.fileName)}`,
      record.imageFile,
    ]),
  );

  return zipExporter.export(metaJson, imageFiles);
}

export function triggerZipDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
