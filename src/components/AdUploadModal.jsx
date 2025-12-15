import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../utils/apiClient';

export default function AdUploadModal({
  isOpen,
  adVideoFile,
  adTitle,
  adDescription,
  adCaption,
  adThumbnailUrl,
  adThumbUploading,
  adThumbFileName,
  adCategory,
  adCategoryCode,
  errorText,
  posting,
  onClose,
  onVideoChange,
  onTitleChange,
  onDescChange,
  onCaptionChange,
  onThumbUrlChange,
  onThumbFileChange,
  onUploadAd,
}){
  if (!isOpen) return null;
  const [categories, setCategories] = useState([]);
  const [catId, setCatId] = useState(adCategory || '');
  const [catCode, setCatCode] = useState(adCategoryCode || '');
  const [localError, setLocalError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const videoInfo = useMemo(()=>{
    if (!adVideoFile) return '';
    const sizeMB = (adVideoFile.size||0)/(1024*1024);
    return `${adVideoFile.name} • ${sizeMB.toFixed(2)} MB`;
  }, [adVideoFile]);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try {
        const res = await apiClient.request('/categories', { method: 'GET' });
        const items = Array.isArray(res?.items) ? res.items : [];
        if (mounted) setCategories(items);
      } catch {}
    })();
    return ()=>{ mounted = false; };
  }, [isOpen]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-0 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Upload Ad Video</h3>
          <button className="text-gray-500" onClick={onClose}>X</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <label className="block text-sm font-medium text-gray-700">Video File (.mp4)</label>
                <input type="file" accept="video/mp4,video/*" onChange={(e)=>onVideoChange?.(e.target.files?.[0]||null)} className="mt-2 block w-full text-sm file:mr-2 file:px-3 file:py-2 file:border-0 file:bg-gray-900 file:text-white file:rounded-md truncate" />
                {videoInfo && (<div className="mt-2 text-xs text-gray-600">{videoInfo}</div>)}
                {localError && (<div className="mt-2 text-xs text-red-600">{localError}</div>)}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input value={adTitle} onChange={(e)=>onTitleChange?.(e.target.value)} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2" placeholder="Ad title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caption</label>
                  <input value={adCaption} onChange={(e)=>onCaptionChange?.(e.target.value)} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2" placeholder="Social caption" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={adDescription} onChange={(e)=>onDescChange?.(e.target.value)} rows={3} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2" placeholder="Describe the ad context" />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select value={catId} onChange={(e)=>setCatId(e.target.value)} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2">
                    <option value="">Select a category</option>
                    {categories.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </div>
                {/* Category Code removed from UI per request */}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input type="url" value={adThumbnailUrl} onChange={(e)=>onThumbUrlChange?.(e.target.value)} className="w-full rounded-md border-gray-300 px-3 py-2" placeholder="https://.../thumb.webp" />
                  </div>
                  <div>
                    <input type="file" accept="image/*" onChange={(e)=>onThumbFileChange?.(e.target.files?.[0]||null)} className="block w-full text-sm file:mr-2 file:px-3 file:py-2 file:border-0 file:bg-gray-900 file:text-white file:rounded-md truncate" />
                  </div>
                </div>
                <div className="mt-3">
                  {adThumbFileName && (<div className="text-[11px] text-gray-600">Selected: <span className="font-medium text-gray-800">{adThumbFileName}</span></div>)}
                  {adThumbUploading && (<div className="text-[11px] text-gray-600">Uploading thumbnail…</div>)}
                  {errorText && (
                    <div className="text-[11px] text-red-600">
                      {errorText.startsWith('<!DOCTYPE') || errorText.includes('<html') ? 'Upload failed due to server error.' : errorText}
                    </div>
                  )}
                </div>
                {adThumbnailUrl && (
                  <img src={adThumbnailUrl} alt="thumb" className="mt-3 h-36 w-full object-cover rounded-lg ring-1 ring-gray-200" />
                )}
              </div>

              <button
                className="text-xs text-gray-600 underline"
                onClick={()=>setShowAdvanced(v=>!v)}
              >{showAdvanced ? 'Hide' : 'Show'} advanced options</button>

              {showAdvanced && (
                <div className="rounded-xl border border-gray-200 p-4 space-y-2 text-xs text-gray-700">
                  <div>Accepted formats: .mp4 • Recommended 1080p or 720p</div>
                  <div>Tip: Provide a concise title and caption to improve discovery.</div>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 left-0 right-0 bg-white pt-4">
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-600">{posting ? 'Uploading…' : 'Ready to upload'}</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={onClose}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-orange-600 disabled:opacity-50"
                  disabled={posting || !adVideoFile || !adTitle || !catId}
                  onClick={()=>{
                    if (!adVideoFile) { setLocalError('Please select a video file.'); return; }
                    if (!adTitle) { setLocalError('Please add a title.'); return; }
                    if (!catId) { setLocalError('Please select a category.'); return; }
                    setLocalError('');
                    const evt = { categoryId: catId ? Number(catId) : undefined };
                    onUploadAd?.(evt);
                  }}
                >Upload</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
