import { useState } from 'react';
import { FileItem } from '../page';

interface BatchTaggingProps {
  fileItems: FileItem[];
  onApplyTags: (selectedFiles: string[], tags: string[]) => void;
}

export function BatchTagging({ fileItems, onApplyTags }: BatchTaggingProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [tags, setTags] = useState<string>('');

  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setTags(input);
  };

  const handleApplyTags = () => {
    if (selectedFiles.length === 0 || !tags.trim()) return;
    
    const tagArray = tags.split(/\s+/).filter(tag => tag.trim());
    onApplyTags(selectedFiles, tagArray);
    setTags('');
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="batch-tagging-container p-4 rounded-lg bg-[var(--card-bg)] backdrop-blur-sm border border-[var(--card-border)]">
      <h3 className="text-lg font-semibold mb-4">Batch Tagging</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Files</label>
        <div className="max-h-40 overflow-y-auto border rounded p-2 border-[var(--card-border)] bg-[var(--hover-bg)]">
          {fileItems.map(item => (
            <div key={item.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={item.id}
                checked={selectedFiles.includes(item.id)}
                onChange={() => toggleFileSelection(item.id)}
                className="mr-2"
              />
              <label htmlFor={item.id} className="text-sm">
                {item.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tags (space separated)</label>
        <input
          type="text"
          value={tags}
          onChange={handleTagInput}
          placeholder="Enter tags separated by spaces"
          className="w-full px-2 py-1 text-sm border rounded bg-transparent text-[var(--text-primary)] border-[var(--card-border)]"
        />
      </div>

      <button
        onClick={handleApplyTags}
        disabled={selectedFiles.length === 0 || !tags.trim()}
        className="bg-purple-500 text-white px-4 py-1 rounded disabled:bg-gray-300 hover:bg-purple-600"
      >
        Apply Tags to Selected Files
      </button>
    </div>
  );
} 