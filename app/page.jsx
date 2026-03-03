'use client'

import { DataProvider } from './context/DataContext'
import { ViewProvider } from './context/ViewContext'
import ViewWrapper from './components/ViewWrapper'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'

export default function Home() {
  return (
    <DataProvider>
      <ViewProvider>
        <ViewWrapper>
          <Header />
          <Dashboard />
          <Footer />
        </ViewWrapper>
      </ViewProvider>
    </DataProvider>
  )
}
