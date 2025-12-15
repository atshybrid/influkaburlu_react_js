import React, { useMemo } from 'react';

export default function AvatarModal({ isOpen, previewUrl, selectedFile, uploadedUrl, saving, errorText, onFileChange, onUpload, onSave, onClose }){
  if (!isOpen) return null;
  const fileInfo = useMemo(()=>{
    if (!selectedFile) return null;
    const sizeMB = (selectedFile.size || 0) / (1024*1024);
    return `${selectedFile.name} • ${sizeMB.toFixed(2)} MB`;
  }, [selectedFile]);
  const displayError = useMemo(()=>{
    if (!errorText) return '';
    // If server returned HTML (e.g., Payload Too Large), show concise message
    if (errorText.startsWith('<!DOCTYPE') || errorText.includes('<html')) return 'Upload failed: Payload too large or server rejected the file.';
    return errorText;
  }, [errorText]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Update Profile Image</h3>
          <button className="text-gray-500" onClick={onClose}>X</button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-gray-700">Upload File</label>
          <div
            className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-4"
            onDragOver={(e)=>{ e.preventDefault(); }}
            onDrop={(e)=>{ e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) onFileChange?.(f); }}
          >
            <div className="text-center">
              <div className="text-sm text-gray-700">Drag and drop an image here</div>
              <div className="text-xs text-gray-500">PNG, JPG up to 20 MB</div>
              <div className="mt-3">
                <input type="file" accept="image/*" onChange={(e)=>onFileChange?.(e.target.files?.[0]||null)} className="block w-full text-sm" />
              </div>
              {fileInfo && (<div className="mt-2 text-xs text-gray-600">{fileInfo}</div>)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-orange-600 disabled:opacity-50" disabled={saving || !selectedFile} onClick={onUpload}>Upload</button>
            <button className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-white bg-gray-900 disabled:opacity-50" disabled={saving || !uploadedUrl} onClick={onSave}>Update Profile</button>
          </div>

          {(previewUrl || uploadedUrl) && (
            <div className="mt-2 flex items-center gap-3">
              <img src={uploadedUrl || previewUrl} alt="preview" className="h-12 w-12 rounded-full object-cover ring-1 ring-gray-200" />
              <span className="text-xs text-gray-600">{uploadedUrl ? 'Ready to update' : 'Preview'}</span>
            </div>
          )}

          {saving && (
            <div className="w-full h-2 rounded bg-gray-100 overflow-hidden">
              <div className="h-full w-1/2 bg-orange-500 animate-pulse" />
            </div>
          )}

          {displayError && (<div className="text-[11px] text-red-600">{displayError}</div>)}

          <div className="flex items-center justify-end gap-2 mt-2">
            <button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
