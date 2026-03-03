import Card from './Card'

export default function ReleasesCard({ items = [] }) {
  const statusColors = {
    'Planned': 'planned',
    'In Progress': 'in-progress',
    'Released': 'released',
    'Deferred': 'deferred'
  }

  const displayItems = items

  return (
    <Card number="06" title="Upcoming Releases">
      {displayItems.length === 0 ? (
        <p className="empty-state">No upcoming releases yet. Add one below.</p>
      ) : (
        <ul>
          {displayItems.map((release, idx) => (
            <li key={idx} className="release-row">
              <div className="row-head">
                <span className="row-name">{release.releaseName}</span>
                <div>
                  <button type="button" className="btn-edit admin-only">Edit</button>
                  <button type="button" className="btn-remove admin-only">×</button>
                </div>
              </div>
              <div className="row-meta">
                <span><strong>Date:</strong> {release.releaseDate}</span>
                <span><strong>OpCo:</strong> {release.releaseOpCo}</span>
                <span>
                  <strong>Status:</strong>{' '}
                  <span className={`release-status-badge ${statusColors[release.releaseStatus] || 'planned'}`}>
                    {release.releaseStatus}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="releases-form admin-only">
        <div className="form-row">
          <input type="text" className="field-release-name" placeholder="Release name" />
          <input type="text" className="field-release-date" placeholder="Release date" />
          <input type="text" className="field-opco" placeholder="Release OpCo" />
          <select className="release-status-select">
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Released">Released</option>
            <option value="Deferred">Deferred</option>
          </select>
          <button type="button" className="add-btn">Add</button>
        </div>
      </div>
    </Card>
  )
}
