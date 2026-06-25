/**
 * @file StatusBadge.jsx
 * @description Redundant status encoding primitive — shape (icon) + token-driven color + text label, never color alone (WCAG 1.4.1). Maps a status value to the status token family; carries no domain taxonomy of its own.
 * @author vintagedon
 * @license MIT
 * @see https://github.com/radioastronomyio/ops-toolbox
 */

import { CheckCircle2, XCircle, AlertTriangle, Info, Minus } from 'lucide-react';

/**
 * Status → { token, Icon }. The token drives color; the Icon is a distinct
 * shape so status is legible without color (WCAG 1.4.1). Add a status here
 * and define its token to extend the family.
 */
const STATUS_CONFIG = {
  success: { token: 'success', Icon: CheckCircle2 },
  error: { token: 'error', Icon: XCircle },
  warning: { token: 'warning', Icon: AlertTriangle },
  info: { token: 'info', Icon: Info },
  neutral: { token: 'neutral', Icon: Minus },
};

/**
 * Render a status with redundant encoding: an icon, a token-driven color, and
 * a text label. Color never carries the status alone.
 *
 * @param {{ status: 'success'|'error'|'warning'|'info'|'neutral', label?: string, children?: React.ReactNode, className?: string, iconOnly?: boolean }} props
 */
export default function StatusBadge({ status, label, children, className = '', iconOnly = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.neutral;
  const { token, Icon } = cfg;
  const text = children ?? label;
  const colorClass = `text-status-${token}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${colorClass} ${className}`}
      role="status"
    >
      <Icon size={16} className={colorClass} strokeWidth={2} aria-hidden="true" focusable="false" />
      {!iconOnly && text ? <span>{text}</span> : null}
    </span>
  );
}
