import { Sidebar } from '@/components/sidebar'
import { PreviewArea } from '@/components/preview-area'
import { HeaderButtons } from '@/components/header-buttons'

export default function Home() {
  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Fixed header */}
      <div className="flex items-center justify-between h-16 p-6 border-b border-stone-200 flex-shrink-0 bg-white z-10">
        <h2 className="text-lg font-semibold">Font Pairs</h2>
        <HeaderButtons />
      </div>
      {/* Main content area with independent scrolling */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <PreviewArea />
      </div>
    </div>
  )
}
