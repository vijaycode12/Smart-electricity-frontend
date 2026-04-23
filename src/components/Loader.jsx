import '../styles/components/Loader.css'

// ── Loader ───────────────────────────────────────────────────────
// Spinning circle. fullPage=true centers it in the whole viewport.
const Loader = ({ size = 32, fullPage = false }) => {
  const spinner = (
    <div className="loader__spinner" style={{ width: size, height: size }} />
  )

  if (fullPage) return <div className="loader-fullpage">{spinner}</div>
  return <div className="loader-inline">{spinner}</div>
}

export default Loader
