import Card from './Card'

export default function ProductPlanCard({ items = [] }) {
  const displayItems = items

  return (
    <Card number="03" title="Review Product Plan">
      {displayItems.length === 0 ? (
        <p className="empty-state">No product plan links yet.</p>
      ) : (
        <ul>
          {displayItems.map((link, idx) => {
            const href = /^https?:\/\//i.test(link) ? link : 'https://' + link
            const displayText = link.length > 60 ? link.slice(0, 57) + '…' : link
            return (
              <li key={idx} className="list-item-has-link" style={{ paddingLeft: 0, marginBottom: '0.5rem' }}>
                <div className="list-item-link-wrap">
                  <a href={href} target="_blank" rel="noopener noreferrer" className="list-item-link">
                    {displayText}
                  </a>
                  <button type="button" className="btn-edit admin-only">Edit</button>
                  <button type="button" className="admin-only" style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '1.2em',
                    lineHeight: '1',
                    padding: '0'
                  }}>×</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <div className="add-item admin-only">
        <input type="text" placeholder="Paste product plan link (URL)..." />
        <button type="button">Add</button>
      </div>
    </Card>
  )
}
