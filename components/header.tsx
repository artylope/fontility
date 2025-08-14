import { HeaderButtons } from './header-buttons'

export function Header() {
    return (
        <div className="bg-background flex flex-col w-full pt-2 px-2 justify-center items-center">
            <div className="p-4 h-14 w-full flex items-center justify-between flex-shrink-0 z-10">
                <h2 className="text-primary uppercase  text-lg font-semibold tracking-wider">Fontility</h2>
                <HeaderButtons />
            </div>
        </div>

    )
} 