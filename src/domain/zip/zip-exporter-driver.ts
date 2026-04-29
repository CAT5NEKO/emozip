import type { MetaJson } from "../../shared/types/emoji.ts";

export interface ZipExporterDriver {
  export(metaJson: MetaJson, imageFiles: Map<string, File>): Promise<Blob>;
}
