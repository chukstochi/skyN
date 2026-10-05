const TABS = [
  ['draft', 'Needs review'],
  ['published', 'Published'],
  ['rejected', 'Rejected'],
  ['sources', 'Sources'],
  ['write', 'Write article'],
]

export default function AdminTabs({ tab, onChange }) {
  return (
    <div className="admin-bar">
      {TABS.map(([key, label]) => (
        <button key={key} className={key === tab ? 'active' : ''} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  )
}
