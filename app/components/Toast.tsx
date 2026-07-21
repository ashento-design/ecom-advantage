export function Toast({ message }: { message: string | null }) {
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${
        message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <div className="bg-gray-900 border border-gray-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-2xl">
        {message}
      </div>
    </div>
  )
}
