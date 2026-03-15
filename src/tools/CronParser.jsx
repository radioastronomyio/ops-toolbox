import React, { useState, useEffect, useCallback } from 'react';
import { describeExpression, parseFields, getNextRuns } from '../lib/cronUtils.js';

const PRESETS = [
  { label: 'Every minute', expr: '* * * * *' },
  { label: 'Every hour', expr: '0 * * * *' },
  { label: 'Weekdays 9 AM', expr: '0 9 * * 1-5' },
  { label: 'Daily midnight', expr: '0 0 * * *' },
  { label: '1st of month', expr: '0 0 1 * *' },
  { label: 'Weekly Sunday', expr: '0 0 * * 0' },
];

const TIMEZONES = ['Local', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo'];
const COUNT_OPTIONS = [5, 10, 20];

function formatDate(date, tz) {
  try {
    const options = {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    };
    if (tz !== 'Local') options.timeZone = tz;
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export default function CronParser() {
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const [count, setCount] = useState(5);
  const [timezone, setTimezone] = useState('Local');
  const [result, setResult] = useState({ description: '', error: null });
  const [fields, setFields] = useState(null);
  const [nextRuns, setNextRuns] = useState([]);

  const evaluate = useCallback((expression) => {
    const r = describeExpression(expression);
    setResult(r);
    setFields(parseFields(expression));
    if (!r.error) {
      setNextRuns(getNextRuns(expression, count, new Date()));
    } else {
      setNextRuns([]);
    }
  }, [count]);

  useEffect(() => {
    evaluate(expr);
  }, [expr, count, evaluate]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Cron Parser</h1>

      {/* Expression input */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <label className="block text-sm font-medium text-slate-300">Cron Expression</label>
        <input
          type="text"
          value={expr}
          onChange={e => setExpr(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
          placeholder="* * * * *"
        />
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.expr}
              onClick={() => setExpr(p.expr)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h2 className="text-sm font-medium text-slate-400 mb-2">Description</h2>
        {result.error ? (
          <p className="text-red-400 text-sm">{result.error}</p>
        ) : (
          <p className="text-slate-100 text-lg">{result.description}</p>
        )}
      </div>

      {/* Field breakdown */}
      {fields && !result.error && (
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-sm font-medium text-slate-400 mb-3">Field Breakdown</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400">
                <th className="text-left py-1 px-2">Minute</th>
                <th className="text-left py-1 px-2">Hour</th>
                <th className="text-left py-1 px-2">Day</th>
                <th className="text-left py-1 px-2">Month</th>
                <th className="text-left py-1 px-2">Weekday</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-slate-100 font-mono">
                <td className="py-1 px-2">{fields.minute}</td>
                <td className="py-1 px-2">{fields.hour}</td>
                <td className="py-1 px-2">{fields.dom}</td>
                <td className="py-1 px-2">{fields.month}</td>
                <td className="py-1 px-2">{fields.dow}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Next runs options */}
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Next runs:</label>
            <select
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none"
            >
              {COUNT_OPTIONS.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-400">Timezone:</span>
            {TIMEZONES.map(tz => (
              <button
                key={tz}
                onClick={() => setTimezone(tz)}
                className={`px-2 py-0.5 text-xs rounded transition-colors ${
                  timezone === tz ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {tz}
              </button>
            ))}
          </div>
        </div>

        {nextRuns.length > 0 && (
          <ul className="space-y-1">
            {nextRuns.map((d, i) => (
              <li key={i} className="text-slate-300 font-mono text-sm bg-slate-900 rounded px-3 py-1">
                {formatDate(d, timezone)}
              </li>
            ))}
          </ul>
        )}
        {!result.error && nextRuns.length === 0 && (
          <p className="text-slate-500 text-sm">No upcoming runs found within 4 years.</p>
        )}
      </div>
    </div>
  );
}
