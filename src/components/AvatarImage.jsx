import React, { useEffect, useState } from 'react';

export default function AvatarImage({ src, alt = 'avatar', className = '' }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const fallback = 'https://images.unsplash.com/photo-1520975922215-c4f2a42b4a97?q=80&w=200&auto=format&fit=crop';
  const finalSrc = error ? fallback : (src || fallback);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative h-12 w-12 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={`h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 bg-gray-50 transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
