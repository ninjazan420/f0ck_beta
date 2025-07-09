import { useState } from 'react';
import { FileItem } from '../page';

interface BatchTaggingProps {
  fileItems: FileItem[];
  onApplyTags: (selectedFiles: string[], tags: string[]) => void;
}

export function BatchTagging({ fileItems, onApplyTags }: BatchTaggingProps) {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState<string>(''); // Renamed from tags to currentTagInput
  const [appliedTags, setAppliedTags] = useState<string[]>([]); // Stores tags to be applied

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTagInput(e.target.value);
  };

  const addTagToList = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !appliedTags.includes(trimmedTag)) {
      setAppliedTags(prevTags => [...prevTags, trimmedTag]);
    }
    setCurrentTagInput(''); // Clear input after adding
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault(); // Prevent default form submission or space input
      addTagToList(currentTagInput);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAppliedTags(prevTags => prevTags.filter(tag => tag !== tagToRemove));
  };

  const handleApplyTagsToSelectedFiles = () => {
    if (selectedFiles.length === 0 || appliedTags.length === 0) return;
    onApplyTags(selectedFiles, appliedTags);
    setAppliedTags([]); // Clear applied tags after applying
    // setSelectedFiles([]); // Optional: clear selection after applying
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
        <label className="block text-sm font-medium mb-2">Tags</label>
        <input
          type="text"
          value={currentTagInput}
          onChange={handleTagInputChange}
          onKeyDown={handleTagInputKeyDown}
          placeholder="Type a tag and press Enter, Space, or Comma"
          className="w-full px-3 py-2 text-sm border rounded-lg bg-transparent text-[var(--text-primary)] border-[var(--input-border)] focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
        {appliedTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {appliedTags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 bg-purple-200 text-purple-800 text-xs font-medium rounded-full">
                {tag}
                <button
                  type="button"
                  className="ml-1.5 inline-flex text-purple-500 hover:text-purple-700"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <span className="sr-only">Remove tag</span>
                  <svg className="h-3 w-3" viewBox="0 0 14 14" fill="currentColor">
                    <path d="M12.12.707a1 1 0 00-1.415 0L7 4.586 3.293.879a1 1 0 10-1.414 1.414L5.586 6 .879 9.707a1 1 0 001.414 1.414L7 7.414l3.707 3.707a1 1 0 001.415-1.414L8.414 6l3.707-3.707a1 1 0 000-1.414L12.12.707z" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleApplyTagsToSelectedFiles} // Changed from handleApplyTags
        disabled={selectedFiles.length === 0 || appliedTags.length === 0} // Changed from !tags.trim()
        className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out"
      >
        Apply Tags to Selected Files
      </button>
    </div>
  );
}