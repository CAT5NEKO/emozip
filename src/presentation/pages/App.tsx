import { useState, useMemo } from "react";
import { DropZone } from "../components/DropZone.tsx";
import { EmojiTable } from "../components/EmojiTable.tsx";
import { SettingsSidebar } from "../components/SettingsSidebar.tsx";
import {
  buildEmojiRecordsFromFiles,
  revokeEmojiRecordPreviewUrl,
} from "../../application/services/emoji-record-builder.ts";
import {
  exportSelectedRecordsAsZip,
  triggerZipDownload,
} from "../../application/usecases/export-zip.ts";
import { generateAliasForName } from "../../application/usecases/generate-alias.ts";
import { JsZipDriver } from "../../infrastructure/zip/zip-driver.ts";
import type { AppSettings, EmojiRecord } from "../../shared/types/emoji.ts";

const DEFAULT_SETTINGS: AppSettings = {
  aliasGeneration: {
    enabled: false,
  },
  commonCategory: "",
  commonLicense: "",
};

export function App() {
  const [records, setRecords] = useState<EmojiRecord[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [exportingIds, setExportingIds] = useState<Set<string>>(new Set());
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const zipDriver = useMemo(() => new JsZipDriver(), []);

  const handleFilesDropped = async (files: File[]) => {
    setIsLoadingFiles(true);
    try {
      const newRecords = await buildEmojiRecordsFromFiles(files, settings);
      setRecords((prev) => [...prev, ...newRecords]);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        newRecords.forEach((r) => next.add(r.id));
        return next;
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectionChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = (selected: boolean) => {
    if (!selected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(records.map((r) => r.id)));
  };

  const handleRecordChange = (updated: EmojiRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteRecord = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (record) {
      revokeEmojiRecordPreviewUrl(record);
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleExportSingle = async (record: EmojiRecord) => {
    setExportingIds((prev) => new Set(prev).add(record.id));
    try {
      const blob = await exportSelectedRecordsAsZip([record], zipDriver);
      triggerZipDownload(blob, `${record.formattedName}.zip`);
    } finally {
      setExportingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const handleExportSelected = async () => {
    const targetRecords = records.filter((r) => selectedIds.has(r.id));
    if (targetRecords.length === 0) {
      return;
    }

    const allIds = targetRecords.map((r) => r.id);
    setExportingIds(new Set(allIds));
    try {
      const blob = await exportSelectedRecordsAsZip(targetRecords, zipDriver);
      triggerZipDownload(blob, "misskey-emojis.zip");
    } finally {
      setExportingIds(new Set());
    }
  };

  const handleRetryAliases = () => {
    if (selectedIds.size === 0) {
      return;
    }

    const updatedRecords = records.map((record) => {
      if (!selectedIds.has(record.id)) {
        return record;
      }
      const newAliases = generateAliasForName(record.formattedName, settings.aliasGeneration);
      return { ...record, aliases: newAliases };
    });
    setRecords(updatedRecords);
  };

  const handleReset = () => {
    if (records.length === 0) {
      return;
    }
    if (!window.confirm("データをすべて消去して初期化しますか？")) {
      return;
    }
    records.forEach(revokeEmojiRecordPreviewUrl);
    setRecords([]);
    setSelectedIds(new Set());
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <header className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between sticky top-0 z-10">
        <h1
          className="text-lg font-bold text-gray-800 tracking-tight cursor-pointer hover:opacity-70 transition-opacity"
          onClick={handleReset}
          title="クリックして初期化"
        >
          EmoZip
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="alias-toggle-header" className="text-xs font-medium text-gray-700">
              エイリアス自動生成(ローマ字のみサポート)
            </label>
            <input
              id="alias-toggle-header"
              type="checkbox"
              checked={settings.aliasGeneration.enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  aliasGeneration: { ...settings.aliasGeneration, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex gap-4 w-full p-4">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <section className="bg-white border border-gray-300 p-2 shrink-0">
            {isLoadingFiles && (
              <div className="text-center text-sm text-gray-600 mb-2">ファイルを読み込み中...</div>
            )}
            <DropZone onFilesDropped={handleFilesDropped} />
          </section>

          {records.length > 0 && (
            <section className="flex-1 bg-white border border-gray-300 flex flex-col">
              <EmojiTable
                records={records}
                selectedIds={selectedIds}
                exportingIds={exportingIds}
                aliasGenerationEnabled={settings.aliasGeneration.enabled}
                onSelectionChange={handleSelectionChange}
                onSelectAll={handleSelectAll}
                onRecordChange={handleRecordChange}
                onDeleteRecord={handleDeleteRecord}
                onExportSingle={handleExportSingle}
                onExportSelected={handleExportSelected}
                onRetryAliases={handleRetryAliases}
              />
            </section>
          )}

          {records.length === 0 && !isLoadingFiles && (
            <div className="text-center py-8 text-gray-500 border border-gray-300 bg-gray-50 flex-1 flex flex-col justify-center">
              <p className="text-sm">画像ファイルを取り込んでください</p>
            </div>
          )}
        </div>

        <SettingsSidebar settings={settings} onSettingsChange={setSettings} />
      </main>
    </div>
  );
}
