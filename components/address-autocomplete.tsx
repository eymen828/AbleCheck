"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2, X } from "lucide-react"

interface AddressSuggestion {
  id: string
  display_name: string
  lat: number
  lon: number
  address: {
    house_number?: string
    road?: string
    city?: string
    postcode?: string
    country?: string
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect?: (suggestion: AddressSuggestion) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Adresse eingeben...",
  className,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Nominatim API für Geocoding (OpenStreetMap)
  const searchAddresses = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
          new URLSearchParams({
            q: query,
            format: "json",
            addressdetails: "1",
            limit: "8",
            countrycodes: "de,at,ch", // DACH-Region
            "accept-language": "de",
          }),
      )

      if (!response.ok) throw new Error("Geocoding failed")

      const data = await response.json()
      const formattedSuggestions: AddressSuggestion[] = data.map((item: any) => ({
        id: item.place_id.toString(),
        display_name: item.display_name,
        lat: Number.parseFloat(item.lat),
        lon: Number.parseFloat(item.lon),
        address: item.address || {},
      }))

      setSuggestions(formattedSuggestions)
      setIsOpen(true)
    } catch (error) {
      console.error("Address search error:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(value)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, searchAddresses])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle selection
  const handleSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name)
    onSelect?.(suggestion)
    setIsOpen(false)
    setSelectedIndex(-1)
    setSuggestions([])
  }

  // Format address for display
  const formatAddress = (suggestion: AddressSuggestion) => {
    const { address } = suggestion
    const parts = []

    if (address.road) {
      let street = address.road
      if (address.house_number) {
        street += ` ${address.house_number}`
      }
      parts.push(street)
    }

    if (address.postcode && address.city) {
      parts.push(`${address.postcode} ${address.city}`)
    } else if (address.city) {
      parts.push(address.city)
    }

    return parts.join(", ")
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        listRef.current &&
        !listRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 3 && suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${className}`}
        />
        {isLoading && <Loader2 className="absolute right-8 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("")
              setSuggestions([])
              setIsOpen(false)
            }}
            className="absolute right-1 top-1 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0" ref={listRef}>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 ${
                  index === selectedIndex ? "bg-accent" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{formatAddress(suggestion)}</p>
                    <p className="text-xs text-muted-foreground truncate">{suggestion.display_name}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No results message */}
      {isOpen && !isLoading && value.length >= 3 && suggestions.length === 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Keine Adressen gefunden für "{value}"
          </CardContent>
        </Card>
      )}
    </div>
  )
}
