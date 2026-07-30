import { useEffect, useRef, useState } from 'react'
import { airportsApi } from '../api/flights'

function AirportAutocomplete({ value, onSelect, placeholder, className }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const debounceRef = useRef(null)
  const blurTimeoutRef = useRef(null)

  useEffect(() => {
    setQuery(value || '')
  }, [value])

  const handleInputChange = (e) => {
    const next = e.target.value.toUpperCase()
    setQuery(next)
    onSelect(null)

    clearTimeout(debounceRef.current)
    if (next.trim().length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      airportsApi.search(next)
        .then(res => {
          setSuggestions(res.data || [])
          setOpen(true)
          setHighlighted(0)
        })
        .catch(() => setSuggestions([]))
    }, 250)
  }

  const selectAirport = (airport) => {
    setQuery(airport.iata_code)
    onSelect(airport)
    setSuggestions([])
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted(h => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      selectAirport(suggestions[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="aa-wrap">
      <input
        className={className}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => { blurTimeoutRef.current = setTimeout(() => setOpen(false), 150) }}
        placeholder={placeholder}
        maxLength={40}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <div className="aa-dropdown">
          {suggestions.map((airport, i) => (
            <div
              key={airport.iata_code}
              className={`aa-option ${i === highlighted ? 'highlighted' : ''}`}
              onMouseDown={(e) => { e.preventDefault(); clearTimeout(blurTimeoutRef.current); selectAirport(airport) }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="aa-option-code">{airport.iata_code}</span>
              <span className="aa-option-name">{airport.name}, {airport.city}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AirportAutocomplete
