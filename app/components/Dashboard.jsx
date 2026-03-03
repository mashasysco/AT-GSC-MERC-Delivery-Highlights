import ActionItemsCard from './ActionItemsCard'
import HighlightsCard from './HighlightsCard'
import ProductPlanCard from './ProductPlanCard'
import ResourceDashboardCard from './ResourceDashboardCard'
import LearningsCard from './LearningsCard'
import ReleasesCard from './ReleasesCard'

export default function Dashboard() {
  return (
    <main className="dashboard">
      <div className="grid">
        <ActionItemsCard />
        <HighlightsCard />
        <ProductPlanCard />
        <ResourceDashboardCard />
        <LearningsCard />
        <ReleasesCard />
      </div>
    </main>
  )
}
