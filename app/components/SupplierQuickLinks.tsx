import { Search } from 'lucide-react'
import { buildSupplierLinks } from '@/app/lib/supplierLinks'

export function SupplierQuickLinks({ title, className }: { title: string; className?: string }) {
  const links = buildSupplierLinks(title)
  const items = [
    { label: 'Find on AliExpress', href: links.aliexpress },
    { label: 'Find on CJDropshipping', href: links.cjdropshipping },
    { label: 'Find on Zendrop', href: links.zendrop },
  ]

  return (
    <div className={className ?? 'flex flex-wrap gap-2'}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
        >
          <Search size={12} />
          {item.label}
        </a>
      ))}
    </div>
  )
}
