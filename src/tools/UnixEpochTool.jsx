import { useState, useEffect } from 'react';
import { fromEpoch, toEpoch, formatInTimezone, parseHumanDate } from '../lib/epochUtils.js';
import CopyButton from '../components/CopyButton';

const TIMEZONES = ['UTC', 'Local', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

function getStartOfTodayUTC() {
  const now = new Date();
  return Math.floor(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).getTime() / 1000);
}

function getRelativeTime(date) {
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const secs = Math.floor(abs / 1000);
  const mins = Math.floor(secs / 60);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const suffix = diff > 0 ? 'ago' : 'from now';
  if (days > 0) return `${days} day${days !== 1 ? 's' : ''} ${suffix}`;
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} ${suffix}`;
  if (mins > 0) return `${mins} minute${mins !== 1 ? 's' : ''} ${suffix}`;
  return `${secs} second${secs !== 1 ? 's' : ''} ${suffix}`;
}

export default function UnixEpochTool() {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [epochInput, setEpochInput] = useState('');
  const [humanInput, setHumanInput] = useState('');
  const [isoInput, setIsoInput] = useState('');

  // Live counter
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Epoch → Human
  const epochResult = epochInput ? fromEpoch(epochInput) : null;

  // Human → Epoch
  const humanDateResult = humanInput ? parseHumanDate(humanInput) : (isoInput ? parseHumanDate(isoInput) : null);
  const humanEpoch = humanDateResult && !humanDateResult.error ? toEpoch(humanDateResult.date) : null;

  const handlePreset = (value) => setEpochInput(String(value));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Unix Epoch Tool</h1>

      {/* Live Counter */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-400">Current Epoch (Live)</h2>
          <CopyButton text={String(now)} />
        </div>
        <div className="font-mono text-3xl text-slate-100">{now}</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePreset(Math.floor(Date.now() / 1000))}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded"
          >
            Now
          </button>
          <button
            onClick={() => handlePreset(getStartOfTodayUTC())}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded"
          >
            Start of today (UTC)
          </button>
          <button
            onClick={() => handlePreset(0)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded"
          >
            Epoch origin (0)
          </button>
        </div>
      </div>

      {/* Epoch → Human */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-slate-400">Epoch → Human</h2>
        <input
          type="text"
          value={epochInput}
          onChange={e => setEpochInput(e.target.value)}
          placeholder="epoch timestamp"
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
        />
        {epochResult && epochResult.error && (
          <p className="text-red-400 text-sm">{epochResult.error}</p>
        )}
        <div className="space-y-2">
          {epochResult && !epochResult.error && (
            <p className="text-xs text-slate-500">
              Detected unit: <span className="text-slate-300">{epochResult.unit}</span>
            </p>
          )}
          {TIMEZONES.map(tz => (
            <div key={tz} className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
              <span className="text-xs text-slate-500 w-32 shrink-0">{tz}</span>
              <span className="text-slate-300 text-sm font-mono flex-1">
                {epochResult && !epochResult.error ? formatInTimezone(epochResult.date, tz) : '—'}
              </span>
            </div>
          ))}
          {epochResult && !epochResult.error && (
            <>
              <div className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
                <span className="text-xs text-slate-500 w-32 shrink-0">ISO 8601</span>
                <span className="text-slate-300 text-sm font-mono flex-1">{epochResult.date.toISOString()}</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 rounded px-3 py-2">
                <span className="text-xs text-slate-500 w-32 shrink-0">Relative</span>
                <span className="text-slate-300 text-sm flex-1">{getRelativeTime(epochResult.date)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Human → Epoch */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-slate-400">Human → Epoch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-500">Date & Time</label>
            <input
              type="datetime-local"
              value={humanInput}
              onChange={e => { setHumanInput(e.target.value); setIsoInput(''); }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-500">ISO 8601 / Natural</label>
            <input
              type="text"
              value={isoInput}
              onChange={e => { setIsoInput(e.target.value); setHumanInput(''); }}
              placeholder="2026-01-01T00:00:00Z"
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        {humanDateResult && humanDateResult.error && (
          <p className="text-red-400 text-sm">{humanDateResult.error}</p>
        )}
        {humanEpoch && (
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-slate-900 rounded px-3 py-2">
              <span className="text-xs text-slate-500 w-24">Seconds</span>
              <span className="text-slate-100 font-mono text-sm flex-1">{humanEpoch.seconds}</span>
              <CopyButton text={String(humanEpoch.seconds)} />
            </div>
            <div className="flex items-center gap-3 bg-slate-900 rounded px-3 py-2">
              <span className="text-xs text-slate-500 w-24">Milliseconds</span>
              <span className="text-slate-100 font-mono text-sm flex-1">{humanEpoch.milliseconds}</span>
              <CopyButton text={String(humanEpoch.milliseconds)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
