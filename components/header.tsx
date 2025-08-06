import { HeaderButtons } from './header-buttons'

export function Header() {
    return (
        <div className="flex items-center justify-between h-16 p-6 border-b border-stone-200 flex-shrink-0 bg-white z-10">
            <h2 className="text-lg font-semibold">Font Pairs</h2>
            <HeaderButtons />
        </div>
    )
} 