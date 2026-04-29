import JSZip from "jszip";
import type { MetaJson } from "../../shared/types/emoji.ts";
import type { ZipExporterDriver } from "../../domain/zip/zip-exporter-driver.ts";

export class JsZipDriver implements ZipExporterDriver {
  public async export(metaJson: MetaJson, imageFiles: Map<string, File>): Promise<Blob> {
    const zip = new JSZip();

    zip.file("meta.json", JSON.stringify(metaJson, null, 2));

    for (const [fileName, file] of imageFiles.entries()) {
      const arrayBuffer = await file.arrayBuffer();
      zip.file(fileName, arrayBuffer);
    }

    return zip.generateAsync({ type: "blob" });
  }
}
