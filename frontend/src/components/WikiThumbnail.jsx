import { useEffect, useRef, useState } from 'react'

const cache = {}

async function fetchThumbnail(query) {
  const normalized = query.trim().toLowerCase()
  if (normalized in cache) return cache[normalized]

  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&pithumbsize=400&format=json&origin=*`

  try {
    const res = await fetch(url)
    const data = await res.json()
    const pages = data?.query?.pages
    const page = pages ? Object.values(pages)[0] : null
    const result = page?.thumbnail?.source || null
    cache[normalized] = result
    return result
  } catch {
    return null
  }
}

function WikiThumbnail({ query, alt, className }) {
  const [src, setSrc] = useState(null)
  const [status, setStatus] = useState('loading')
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSrc(null)
      setStatus('idle')
      return
    }

    setStatus('loading')
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchThumbnail(query).then(result => {
        setSrc(result)
        setStatus(result ? 'found' : 'not-found')
      })
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  if (status === 'idle') return null

  if (status === 'loading') {
    return <div className={`${className} wiki-thumb-placeholder`}>Loading photo…</div>
  }

  if (status === 'not-found' || !src) {
    return (
      <div className={`${className} wiki-thumb-placeholder`}>
        <span className="wiki-thumb-icon">✈</span>
        <span>No photo found</span>
      </div>
    )
  }

  return <img className={className} src={src} alt={alt} />
}

export default WikiThumbnail
