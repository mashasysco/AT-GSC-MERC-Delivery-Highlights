export default function Card({ number, title, children }) {
  return (
    <section className="card">
      <div className="card-header">
        <span className="card-num">{number}</span>
        <h2 className="card-title">{title}</h2>
      </div>
      <div className="card-body">
        {children}
      </div>
    </section>
  )
}
