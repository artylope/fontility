import { HeaderButtons } from './header-buttons'

export function Header() {
    return (
        <div className="flex items-center justify-between h-16 p-4 border-b border-border flex-shrink-0 bg-background z-10">
            <h2 className="text-lg font-semibold">Fontility Pair</h2>
            <HeaderButtons />
        </div>
    )
} 