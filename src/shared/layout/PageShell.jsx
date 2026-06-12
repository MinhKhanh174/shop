export default function PageShell({ children }) {
  return (
    <main className="page-shell mx-auto w-full max-w-[1480px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      {children}
    </main>
  )
}
