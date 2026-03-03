import Card from './Card'

export default function HighlightsCard({ items = [] }) {
  const ragColors = {
    'Red': 'rag-red',
    'Amber': 'rag-amber',
    'Green': 'rag-green'
  }

  const displayItems = items

  return (
    <Card number="02" title="Delivery Highlights &amp; Challenges">
      {displayItems.length === 0 ? (
        <p className="empty-state">No teams yet. Add a team below.</p>
      ) : (
        <ul>
          {displayItems.map((team, teamIdx) => (
            <li key={teamIdx} style={{ listStyle: 'none', marginBottom: '1rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.5rem' }}>
                  {team.teamName}
                </h3>
                {team.initiatives && team.initiatives.map((init, initIdx) => (
                  <div key={initIdx} className={`highlight-row ${ragColors[init.rag] || 'rag-green'}`}>
                    <div className="row-header">
                      <div>
                        <div className="row-team">{init.name}</div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`row-rag ${ragColors[init.rag] || 'rag-green'}`}>{init.rag}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong>ETA:</strong> {init.eta}
                          </span>
                        </div>
                      </div>
                    </div>
                    {init.keyHighlights && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text)' }}>
                        <strong>Key Highlights:</strong> {init.keyHighlights}
                      </div>
                    )}
                    {init.raid && (
                      <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>RAID:</strong> {init.raid}
                      </div>
                    )}
                    {init.challenges && (
                      <div style={{ marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <strong>Challenges:</strong> {init.challenges}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="admin-only" style={{ marginTop: '0.75rem' }}>
        <div className="form-row">
          <input type="text" className="field-team" placeholder="Team name" style={{ maxWidth: '200px' }} />
          <button type="button" className="add-btn">Add Team</button>
        </div>
      </div>
    </Card>
  )
}
