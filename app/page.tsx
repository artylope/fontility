import { Sidebar } from '@/components/sidebar'
import { PreviewArea } from '@/components/preview-area'
import { HeaderButtons } from '@/components/header-buttons'

export default function Home() {
  return (
    <div className=" h-screen bg-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between h-16 p-6 border-b border-stone-200">
        <h2 className="text-lg font-semibold">Font Pairs</h2>
        <HeaderButtons />
      </div>
      <div className="flex h-full">
        <Sidebar />
        <PreviewArea />
      </div>

    </div>
  )
}
