import type { AppSettings } from "../../shared/types/emoji.ts";

type SettingsSidebarProps = {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
};

export function SettingsSidebar({ settings, onSettingsChange }: SettingsSidebarProps) {
  const updateSettings = (partial: Partial<AppSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  return (
    <aside className="w-80 shrink-0 bg-white border border-gray-300 p-4 self-start sticky top-[69px]">
      <h2 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
        一括設定 (新規追加用)
      </h2>

      <div className="space-y-4">
        <section>
          <label htmlFor="common-category" className="block text-xs font-medium text-gray-700 mb-1">
            共通カテゴリ
          </label>
          <input
            id="common-category"
            type="text"
            value={settings.commonCategory}
            onChange={(e) => updateSettings({ commonCategory: e.target.value })}
            placeholder="例: ブルースリー"
            className="w-full h-8 bg-white border border-gray-300 text-gray-800 text-xs px-2 focus:outline-none focus:border-blue-500"
          />
        </section>

        <section>
          <label htmlFor="common-license" className="block text-xs font-medium text-gray-700 mb-1">
            共通ライセンス
          </label>
          <textarea
            id="common-license"
            rows={4}
            value={settings.commonLicense}
            onChange={(e) => updateSettings({ commonLicense: e.target.value })}
            placeholder="例: テスト"
            className="w-full bg-white border border-gray-300 text-gray-800 text-xs p-2 focus:outline-none focus:border-blue-500 resize-none"
          />
        </section>

        <div className="text-[10px] text-gray-500 bg-gray-50 p-2 border border-gray-200">
          <p>※ ここで入力した後にインポートしたファイルに自動的に適用されます。</p>
        </div>
      </div>
    </aside>
  );
}
