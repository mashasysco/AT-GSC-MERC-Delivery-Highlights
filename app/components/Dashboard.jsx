import ActionItemsCard from './ActionItemsCard'
import HighlightsCard from './HighlightsCard'
import ProductPlanCard from './ProductPlanCard'
import ResourceDashboardCard from './ResourceDashboardCard'
import LearningsCard from './LearningsCard'
import ReleasesCard from './ReleasesCard'
import FileUploadSection from './FileUploadSection'

export default function Dashboard() {
  return (
    <main className="dashboard">
      <FileUploadSection />
      <div className="flex-1 gap-20 space-y-4">
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
