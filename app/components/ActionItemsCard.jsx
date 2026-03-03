import Card from './Card'

export default function ActionItemsCard({ items = [] }) {
  const statusColors = {
    'Not Started': 'status-not-started',
    'In Progress': 'status-in-progress',
    'Completed': 'status-completed',
    'On Hold': 'status-on-hold',
    'Cancelled': 'status-cancelled'
  }

  const displayItems = items

  return (
    <Card number="01" title="Action Items &amp; Followups">
      {displayItems.length === 0 ? (
        <p className="empty-state">No action items yet. Add one below.</p>
      ) : (
        <ul>
          {displayItems.map((item, idx) => (
            <li key={idx} className="action-item-row">
              <div className="row-top">
                <span className="row-title">{item.text}</span>
                <div className="row-meta">
                  <select className={`status-select ${statusColors[item.status] || 'status-not-started'}`} defaultValue={item.status}>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {item.notes && (
                <div className="row-notes">{item.notes}</div>
              )}
            </li>
          ))}
        </ul>
      )}
      <div className="action-item-form admin-only">
        <div className="form-row">
          <input type="text" className="action-input" placeholder="Action item..." />
          <select className="status-select-form status-not-started">
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <button type="button" className="add-btn">Add</button>
        </div>
        <div className="form-row">
          <textarea placeholder="Notes / comments (optional)..."></textarea>
        </div>
      </div>
    </Card>
  )
}
