export default function WatermarkFooter() {
  return (
    <div className="mt-10 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
      <a
        href="https://www.instagram.com/justinkjames.xyz/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium transition-colors hover:opacity-90"
        style={{ color: 'var(--text-muted)' }}
      >
        <span style={{ color: 'var(--accent)' }}>Web Developer:</span>
        <span>Justin James</span>
      </a>
    </div>
  )
}
