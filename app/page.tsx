import { Sidebar } from '@/components/sidebar'
import { PreviewArea } from '@/components/preview-area'
import { Header } from '@/components/header'

export default function Home() {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Fixed header */}
      <Header />
      {/* Main content area with independent scrolling */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <PreviewArea />
      </div>
    </div>
  )
}
