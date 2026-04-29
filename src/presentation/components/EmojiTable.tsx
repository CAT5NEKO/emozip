import { useState } from "react";
import type { EmojiRecord } from "../../shared/types/emoji.ts";

type AliasTagListProps = {
  aliases: string[];
  onAliasesChange: (aliases: string[]) => void;
};

function AliasTagList({ aliases, onAliasesChange }: AliasTagListProps) {
  const [inputValue, setInputValue] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const addAlias = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || aliases.includes(trimmed)) {
      setInputValue("");
      return;
    }
    onAliasesChange([...aliases, trimmed]);
    setInputValue("");
  };

  const startEditing = (index: number, value: string) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const finishEditing = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) {
      removeAlias(aliases[editingIndex]);
    } else {
      const newAliases = [...aliases];
      newAliases[editingIndex] = trimmed;
      onAliasesChange(Array.from(new Set(newAliases)));
    }
    setEditingIndex(null);
  };

  const removeAlias = (alias: string) => {
    onAliasesChange(aliases.filter((a) => a !== alias));
  };

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAlias();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEditing();
    } else if (e.key === "Escape") {
      setEditingIndex(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-1 items-center min-h-[24px] py-0.5">
      {aliases.map((alias, index) => (
        <div key={`${alias}-${index}`} className="flex items-center">
          {editingIndex === index ? (
            <input
              autoFocus
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleEditKeyDown}
              onBlur={finishEditing}
              className="bg-white text-gray-800 text-xs px-1 py-0 border border-blue-500 outline-none w-[80px]"
            />
          ) : (
            <span
              onClick={() => startEditing(index, alias)}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 border border-gray-300 cursor-pointer hover:bg-gray-200"
            >
              {alias}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAlias(alias);
                }}
                className="text-gray-400 hover:text-red-500 ml-0.5"
                aria-label={`${alias}を削除`}
              >
                ×
              </button>
            </span>
          )}
        </div>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddKeyDown}
        onBlur={addAlias}
        placeholder="追加..."
        className="flex-1 min-w-[60px] h-5 bg-transparent text-gray-800 text-xs outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

type EmojiTableRowProps = {
  record: EmojiRecord;
  isSelected: boolean;
  isExporting: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
  onRecordChange: (updated: EmojiRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportSingle: (record: EmojiRecord) => void;
};

function EmojiTableRow({
  record,
  isSelected,
  isExporting,
  onSelectionChange,
  onRecordChange,
  onDeleteRecord,
  onExportSingle,
}: EmojiTableRowProps) {
  const updateField = <K extends keyof EmojiRecord>(field: K, value: EmojiRecord[K]) => {
    onRecordChange({ ...record, [field]: value });
  };

  return (
    <tr className="border-b border-gray-300 hover:bg-gray-50">
      <td className="p-1 border-r border-gray-300 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectionChange(record.id, e.target.checked)}
          className="cursor-pointer"
        />
      </td>
      <td className="p-1 border-r border-gray-300">
        <div className="w-8 h-8 flex items-center justify-center mx-auto">
          <img
            src={record.imagePreviewUrl}
            alt={record.formattedName}
            className="w-full h-full object-contain"
          />
        </div>
      </td>
      <td className="p-1 border-r border-gray-300 min-w-[150px]">
        <div className="flex flex-col justify-center h-full">
          <input
            type="text"
            value={record.formattedName}
            onChange={(e) => updateField("formattedName", e.target.value)}
            className="w-full h-6 bg-white border border-gray-300 text-gray-800 text-xs px-1.5 focus:outline-none focus:border-blue-500 font-mono"
          />
          <div
            className="text-[9px] text-gray-500 leading-none mt-0.5 truncate"
            title={record.fileName}
          >
            {record.fileName}
          </div>
        </div>
      </td>
      <td className="p-1 border-r border-gray-300 min-w-[100px]">
        <div className="flex flex-col justify-center h-full">
          <input
            type="text"
            value={record.category}
            onChange={(e) => updateField("category", e.target.value)}
            className="w-full h-6 bg-white border border-gray-300 text-gray-800 text-xs px-1.5 focus:outline-none focus:border-blue-500"
          />
          <div className="h-[9px] mt-0.5"></div>
        </div>
      </td>
      <td className="p-1 border-r border-gray-300 min-w-[100px]">
        <div className="flex flex-col justify-center h-full">
          <input
            type="text"
            value={record.license || ""}
            onChange={(e) => updateField("license", e.target.value)}
            className="w-full h-6 bg-white border border-gray-300 text-gray-800 text-xs px-1.5 focus:outline-none focus:border-blue-500"
          />
          <div className="h-[9px] mt-0.5"></div>
        </div>
      </td>
      <td className="p-1 border-r border-gray-300 min-w-[150px]">
        <div className="flex flex-col justify-center h-full">
          <div className="bg-white border border-gray-300 px-1.5 focus-within:border-blue-500 min-h-[24px]">
            <AliasTagList
              aliases={record.aliases}
              onAliasesChange={(aliases) => updateField("aliases", aliases)}
            />
          </div>
          <div className="h-[9px] mt-0.5"></div>
        </div>
      </td>
      <td className="p-1 border-r border-gray-300 text-center">
        <input
          type="checkbox"
          checked={record.isSensitive}
          onChange={(e) => updateField("isSensitive", e.target.checked)}
          className="cursor-pointer"
        />
      </td>
      <td className="p-1 border-r border-gray-300 text-center">
        <input
          type="checkbox"
          checked={record.localOnly}
          onChange={(e) => updateField("localOnly", e.target.checked)}
          className="cursor-pointer"
        />
      </td>
      <td className="p-1 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={() => onExportSingle(record)}
            disabled={isExporting}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[10px] px-2 py-0.5 whitespace-nowrap"
          >
            {isExporting ? "出力中" : "個別出力"}
          </button>
          <button
            type="button"
            onClick={() => onDeleteRecord(record.id)}
            className="bg-red-100 hover:bg-red-200 text-red-600 text-[10px] px-2 py-0.5 whitespace-nowrap"
          >
            削除
          </button>
        </div>
      </td>
    </tr>
  );
}

type EmojiTableProps = {
  records: EmojiRecord[];
  selectedIds: Set<string>;
  exportingIds: Set<string>;
  aliasGenerationEnabled: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRecordChange: (updated: EmojiRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportSingle: (record: EmojiRecord) => void;
  onExportSelected: () => void;
  onRetryAliases: () => void;
};

export function EmojiTable({
  records,
  selectedIds,
  exportingIds,
  aliasGenerationEnabled,
  onSelectionChange,
  onSelectAll,
  onRecordChange,
  onDeleteRecord,
  onExportSingle,
  onExportSelected,
  onRetryAliases,
}: EmojiTableProps) {
  const allSelected = records.length > 0 && selectedIds.size === records.length;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between p-2 border-b border-gray-300 bg-gray-100">
        <div className="text-sm font-bold text-gray-800">絵文字データ ({records.length}件)</div>
        <div className="flex items-center gap-2">
          {aliasGenerationEnabled && (
            <button
              type="button"
              onClick={onRetryAliases}
              disabled={selectedIds.size === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-3 py-1 font-bold"
            >
              エイリアス再生成 ({selectedIds.size})
            </button>
          )}
          <button
            type="button"
            onClick={onExportSelected}
            disabled={selectedIds.size === 0}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1 font-bold"
          >
            一括エクスポート ({selectedIds.size})
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-200 border-b border-gray-300">
              <th className="p-1 border-r border-gray-300 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 w-12">
                画像
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 text-left">
                名前
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 text-left">
                カテゴリ
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 text-left">
                ライセンス
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 text-left">
                エイリアス
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 w-12">
                センシ
              </th>
              <th className="p-1 border-r border-gray-300 text-xs font-normal text-gray-700 w-16">
                ローカル
              </th>
              <th className="p-1 text-xs font-normal text-gray-700 w-24">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <EmojiTableRow
                key={record.id}
                record={record}
                isSelected={selectedIds.has(record.id)}
                isExporting={exportingIds.has(record.id)}
                onSelectionChange={onSelectionChange}
                onRecordChange={onRecordChange}
                onDeleteRecord={onDeleteRecord}
                onExportSingle={onExportSingle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
