import { useState, useRef } from "react";

type DropZoneProps = {
  onFilesDropped: (files: File[]) => void;
};

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/gif",
  "image/webp",
  "image/jpeg",
  "image/apng",
  "image/svg+xml",
];

const ACCEPTED_EXTENSIONS = [".png", ".gif", ".webp", ".jpg", ".jpeg", ".apng", ".svg"];

function isAcceptedFileType(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  const isAcceptedMime = ACCEPTED_IMAGE_TYPES.includes(type);
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));

  return isAcceptedMime || hasAcceptedExtension;
}

export function DropZone({ onFilesDropped }: DropZoneProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    const items = event.dataTransfer.items;
    if (!items) return;

    const files: File[] = [];

    const traverseFileTree = async (item: any) => {
      if (item.isFile) {
        return new Promise<void>((resolve) => {
          item.file((file: File) => {
            if (isAcceptedFileType(file)) {
              files.push(file);
            }
            resolve();
          });
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            const promises = entries.map((entry) => traverseFileTree(entry));
            await Promise.all(promises);
            resolve();
          });
        });
      }
    };

    const promises = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        promises.push(traverseFileTree(item));
      }
    }

    await Promise.all(promises);

    if (files.length > 0) {
      onFilesDropped(files);
    }
  };

  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files).filter(isAcceptedFileType);
    if (files.length > 0) onFilesDropped(files);
    event.target.value = "";
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    folderInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed p-6 text-center transition-colors ${
        isDraggingOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="pointer-events-none">
          <p className="text-sm font-bold text-gray-700">画像ファイル/フォルダをここにドロップもしくは選択</p>
          <p className="text-[10px] text-gray-400 mt-1">対応: PNG, GIF, WebP, JPEG, APNG, SVG</p>
        </div>

        <div className="flex items-center gap-3 w-full max-w-xs">
          <label className="flex-1 flex flex-col items-center gap-1 p-3 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
            <input
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS.join(",")}
              className="hidden"
              onChange={handleFileInputChange}
            />
            <span className="text-xl">📄</span>
            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600">
              ファイルを選択
            </span>
          </label>

          <button
            type="button"
            onClick={handleFolderClick}
            className="flex-1 flex flex-col items-center gap-1 p-3 bg-white border border-gray-300 rounded cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group"
          >
            <input
              type="file"
              ref={folderInputRef}
              // @ts-ignore
              webkitdirectory="true"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <span className="text-xl">📁</span>
            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600">
              フォルダを選択
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
