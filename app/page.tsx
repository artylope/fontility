import { Sidebar } from '@/components/sidebar'
import { PreviewArea } from '@/components/preview-area'

export default function Home() {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <PreviewArea />
    </div>
  )
}
