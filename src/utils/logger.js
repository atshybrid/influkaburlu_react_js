const debugEnabled = (() => {
  try {
    const val = import.meta?.env?.VITE_DEBUG;
    if (val == null) return false;
    if (typeof val === 'string') return val === 'true' || val === '1' || val.toLowerCase() === 'yes';
    return !!val;
  } catch {
    return false;
  }
})();

function formatArgs(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level}]`, ...args];
}

export const logger = {
  info: (...args) => {
    if (debugEnabled) console.log(...formatArgs('info', args));
  },
  warn: (...args) => {
    if (debugEnabled) console.warn(...formatArgs('warn', args));
  },
  error: (...args) => {
    // Always log errors, but with consistent format
    console.error(...formatArgs('error', args));
  },
  debug: (...args) => {
    if (debugEnabled) console.debug(...formatArgs('debug', args));
  }
};

export default logger;
