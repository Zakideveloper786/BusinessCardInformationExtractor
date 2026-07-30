import React, { useRef, useState } from 'react';
import { UploadCloud, Link2, Image as ImageIcon, Cpu, X, FileImage } from 'lucide-react';

const UploadCard = ({
  file,
  setFile,
  url,
  setUrl,
  activeTab,
  setActiveTab,
  onExtract,
  isLoading,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // File drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setUrl(''); // Clear URL if image uploaded
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl(''); // Clear URL if image uploaded
    }
  };

  const triggerBrowse = () => {
    if (isLoading) return;
    fileInputRef.current.click();
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setFile(null); // Clear File if URL entered
  };

  // Check if we have valid input to extract
  const hasInput = (activeTab === 'upload' && file !== null) || (activeTab === 'url' && url.trim() !== '');

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl">
      {/* Input Glass Card */}
      <div className="glass-panel p-6 flex flex-col gap-6">
        {/* Title */}
        <div className="flex items-center gap-3">
          <UploadCloud className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold tracking-wide">Upload Business Card</h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => !isLoading && setActiveTab('upload')}
            disabled={isLoading}
          >
            <ImageIcon className="w-4 h-4" />
            Upload Image
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => !isLoading && setActiveTab('url')}
            disabled={isLoading}
          >
            <Link2 className="w-4 h-4" />
            Image URL
          </button>
        </div>

        {/* Option 1: Upload Drag & Drop / File Input */}
        {activeTab === 'upload' && (
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />

            {!file ? (
              <div
                className={`dropzone ${isDragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerBrowse}
              >
                <div className="flex flex-col items-center gap-2 py-4">
                  <UploadCloud className="w-12 h-12 text-blue-500 mb-2" />
                  <p className="text-sm text-slate-300">
                    Drag & drop your business card here, or{' '}
                    <span className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500">Supports PNG, JPG, JPEG (Max 8MB)</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/20 flex justify-center items-center p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Business Card Preview"
                  className="w-full max-h-64 object-contain rounded-lg shadow-md animate-fade-in"
                />
                {!isLoading && (
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white border border-white/10 transition-colors shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Option 2: Image URL Input */}
        {activeTab === 'url' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="imageUrl" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Paste Image URL
              </label>
              <div className="relative flex items-center">
                <Link2 className="absolute left-3.5 w-5 h-5 text-slate-500" />
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/businesscard.jpg"
                  value={url}
                  onChange={handleUrlChange}
                  disabled={isLoading}
                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder:text-slate-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* URL Image Preview */}
            {url.trim() && url.startsWith('http') && (
              <div className="rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900/20 max-h-48 flex justify-center items-center p-2">
                <img
                  src={url}
                  alt="Business Card Preview"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                  onLoad={(e) => {
                    e.target.style.display = 'block';
                  }}
                  className="max-h-44 object-contain rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        type="button"
        onClick={onExtract}
        disabled={!hasInput || isLoading}
        className="primary-btn w-full py-4 text-base"
      >
        <Cpu className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
        {isLoading ? 'Processing...' : 'Extract Information'}
      </button>
    </div>
  );
};

export default UploadCard;
