export type EmojiRecord = {
  id: string;
  fileName: string;
  formattedName: string;
  category: string;
  aliases: string[];
  isSensitive: boolean;
  localOnly: boolean;
  license: string | null;
  imageFile: File;
  imagePreviewUrl: string;
};

export type MetaJsonEmoji = {
  downloaded: boolean;
  fileName: string;
  emoji: {
    name: string;
    category: string;
    aliases: string[];
    license?: string;
    isSensitive?: boolean;
    localOnly?: boolean;
  };
};

export type MetaJson = {
  emojis: MetaJsonEmoji[];
};

export type AliasGenerationSettings = {
  enabled: boolean;
};

export type AppSettings = {
  aliasGeneration: AliasGenerationSettings;
  commonCategory: string;
  commonLicense: string;
};
