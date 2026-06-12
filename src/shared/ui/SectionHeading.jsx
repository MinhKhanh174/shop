export function SectionHeading({ eyebrow, title, action }) {
  const normalizedEyebrow = String(eyebrow ?? '').trim().toLowerCase()
  const normalizedTitle = String(title ?? '').trim().toLowerCase()
  const shouldShowEyebrow = eyebrow && normalizedEyebrow !== normalizedTitle

  return (
    <div className="section-heading">
      <div>
        {shouldShowEyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  )
}
