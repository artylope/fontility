import { Sidebar } from '@/components/sidebar'
import { PreviewArea } from '@/components/preview-area'

export default function Home() {
  return (
    <div className=" h-screen bg-white flex flex-col">
      <div className="flex flex-col h-16 p-4 justify-between border-b border-stone-200">
        <h2 className="text-lg font-semibold">Font Pairs</h2>

      </div>
      <div className="flex h-full">
        <Sidebar />
        <PreviewArea />
      </div>

    </div>
  )
}
