// src/components/shared/StatusBadge.jsx
const STATUS_CONFIG = {
  searching:  { label: '🔍 Searching Vendor', cls: 'badge-searching'  },
  accepted:   { label: '✅ Accepted',          cls: 'badge-accepted'   },
  on_the_way: { label: '🛺 On the Way',        cls: 'badge-on_the_way' },
  delivered:  { label: '🎉 Delivered',         cls: 'badge-delivered'  },
  rejected:   { label: '❌ Rejected',          cls: 'badge-rejected'   },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: '' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
