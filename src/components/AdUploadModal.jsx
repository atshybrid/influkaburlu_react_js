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
  const [showThumbnail, setShowThumbnail] = useState(!!adThumbnailUrl);
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

  const combinedError = errorText || localError;
  useEffect(() => {
    // If a thumbnail is already present/uploading, keep the section open
    if (adThumbnailUrl || adThumbUploading || adThumbFileName) setShowThumbnail(true);
  }, [adThumbnailUrl, adThumbUploading, adThumbFileName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative w-[95vw] max-w-2xl h-[80vh] max-h-[720px] rounded-2xl bg-white p-0 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Ad Video</h3>
            <p className="mt-1 text-xs text-gray-600">Upload a short ad video to show brands your best work.</p>
          </div>
          <button
            type="button"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>
        <div className="p-6 h-[calc(80vh-72px)] max-h-[calc(720px-72px)] overflow-y-auto">
          {combinedError && (
            <div className="mb-4 rounded-xl bg-red-50 ring-1 ring-red-200 px-4 py-3 text-sm text-red-700">
              {String(combinedError).startsWith('<!DOCTYPE') || String(combinedError).includes('<html')
                ? 'Upload failed due to a server error.'
                : combinedError}
            </div>
          )}

          <div className="space-y-4">
            {/* 1) Title + Caption */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">1) Title & Caption</div>
                  <div className="mt-0.5 text-xs text-gray-600">These are sent in the payload with your upload.</div>
                </div>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-600">*</span></label>
                  <input value={adTitle} onChange={(e)=>onTitleChange?.(e.target.value)} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2" placeholder="e.g., Skincare routine ad" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caption</label>
                  <input value={adCaption} onChange={(e)=>onCaptionChange?.(e.target.value)} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2" placeholder="e.g., Try this in 30 seconds" />
                </div>
              </div>
            </div>

            {/* 2) Category */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">2) Select category</div>
                  <div className="mt-0.5 text-xs text-gray-600">Required to organize your ad.</div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200">Required</span>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-600">*</span></label>
                <select value={catId} onChange={(e)=>setCatId(e.target.value)} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2">
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3) Video file */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">3) Upload video file</div>
                  <div className="mt-0.5 text-xs text-gray-600">Choose an MP4 (or any supported video).</div>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 ring-1 ring-orange-200">Required</span>
              </div>
              <input
                type="file"
                accept="video/mp4,video/*"
                onChange={(e)=>onVideoChange?.(e.target.files?.[0]||null)}
                className="mt-3 block w-full text-sm file:mr-2 file:px-3 file:py-2 file:border-0 file:bg-gray-900 file:text-white file:rounded-md truncate"
              />
              {videoInfo && (
                <div className="mt-2 text-xs text-gray-600">Selected: <span className="font-medium text-gray-800">{videoInfo}</span></div>
              )}
            </div>

            {/* 4) Thumbnail (optional) */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900">4) Thumbnail (optional)</div>
                  <div className="mt-0.5 text-xs text-gray-600">Optional, but recommended.</div>
                </div>
                <button
                  type="button"
                  className="text-xs text-gray-700 px-3 py-1.5 rounded-md bg-gray-100 ring-1 ring-gray-200"
                  onClick={()=>setShowThumbnail(v=>!v)}
                >
                  {showThumbnail ? 'Hide' : 'Add'} thumbnail
                </button>
              </div>

              {showThumbnail && (
                <>
                  <div className="mt-4 grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Thumbnail URL</label>
                      <input type="url" value={adThumbnailUrl} onChange={(e)=>onThumbUrlChange?.(e.target.value)} className="mt-1 w-full rounded-md border-gray-300 px-3 py-2" placeholder="https://.../thumb.webp" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Upload image</label>
                      <input type="file" accept="image/*" onChange={(e)=>onThumbFileChange?.(e.target.files?.[0]||null)} className="mt-1 block w-full text-sm file:mr-2 file:px-3 file:py-2 file:border-0 file:bg-gray-900 file:text-white file:rounded-md truncate" />
                    </div>
                  </div>
                  <div className="mt-3">
                    {adThumbFileName && (<div className="text-[11px] text-gray-600">Selected: <span className="font-medium text-gray-800">{adThumbFileName}</span></div>)}
                    {adThumbUploading && (<div className="text-[11px] text-gray-600">Uploading thumbnail…</div>)}
                  </div>
                  {adThumbnailUrl && (
                    <img src={adThumbnailUrl} alt="thumb" className="mt-3 h-36 w-full object-cover rounded-lg ring-1 ring-gray-200" />
                  )}
                </>
              )}
            </div>

            {/* 5) Description (optional) */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900">5) Description (optional)</div>
                  <div className="mt-0.5 text-xs text-gray-600">Any extra context for brands (optional).</div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={adDescription} onChange={(e)=>onDescChange?.(e.target.value)} rows={3} className="mt-2 w-full rounded-md border-gray-300 px-3 py-2" placeholder="Short context (optional)" />
              </div>
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

          <div className="sticky bottom-0 left-0 right-0 bg-white pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 pt-4">
              <div className="text-xs text-gray-600">
                {posting ? 'Uploading…' : 'Required: video, title, category'}
              </div>
              <div className="flex items-center justify-end gap-2">
                <button className="px-3 py-2 rounded-md text-sm bg-gray-100" onClick={onClose} disabled={posting || adThumbUploading}>Cancel</button>
                <button
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600 to-pink-600 disabled:opacity-50"
                  disabled={posting || adThumbUploading || !adVideoFile || !adTitle || !catId}
                  onClick={()=>{
                    if (!adVideoFile) { setLocalError('Please select a video file.'); return; }
                    if (!adTitle) { setLocalError('Please add a title.'); return; }
                    if (!catId) { setLocalError('Please select a category.'); return; }
                    setLocalError('');
                    const evt = { categoryId: catId ? Number(catId) : undefined };
                    onUploadAd?.(evt);
                  }}
                >
                  {posting ? 'Uploading…' : 'Upload video'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
