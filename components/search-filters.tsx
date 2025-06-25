"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Filter, X, Star, Users } from "lucide-react"

export interface SearchFilters {
  minRating: number
  minReviews: number
  sortBy: "rating" | "reviews" | "name" | "date"
  sortOrder: "asc" | "desc"
}

interface SearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  totalResults: number
  filteredResults: number
}

const SORT_OPTIONS = [
  { value: "rating", label: "Bewertung" },
  { value: "reviews", label: "Anzahl Bewertungen" },
  { value: "name", label: "Name" },
  { value: "date", label: "Datum" },
]

export function SearchFilters({
  filters,
  onFiltersChange,
  totalResults,
  filteredResults,
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const updateFilters = (updates: Partial<SearchFilters>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const clearFilters = () => {
    onFiltersChange({
      minRating: 0,
      minReviews: 0,
      sortBy: "rating",
      sortOrder: "desc",
    })
  }

  const hasActiveFilters =
    filters.minRating > 0 || filters.minReviews > 0

  return (
    <div className="flex items-center gap-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 relative">
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs">
                !
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              Suchfilter
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600">
                  <X className="w-4 h-4 mr-1" />
                  Zurücksetzen
                </Button>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Results Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{filteredResults}</p>
                  <p className="text-sm text-muted-foreground">von {totalResults} Orten</p>
                </div>
              </CardContent>
            </Card>

            {/* Rating Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                Mindestbewertung: {filters.minRating === 0 ? "Alle" : `${filters.minRating}+ Sterne`}
              </Label>
              <Slider
                value={[filters.minRating]}
                onValueChange={([value]) => updateFilters({ minRating: value })}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Alle</span>
                <span>5 Sterne</span>
              </div>
            </div>

            {/* Reviews Filter */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Mindest-Bewertungen: {filters.minReviews === 0 ? "Alle" : `${filters.minReviews}+`}
              </Label>
              <Slider
                value={[filters.minReviews]}
                onValueChange={([value]) => updateFilters({ minReviews: value })}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>50+</span>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-3">
              <Label>Sortierung</Label>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.sortBy === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateFilters({ sortBy: option.value as any })}
                    className="text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filters.sortOrder === "desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ sortOrder: "desc" })}
                  className="flex-1 text-xs"
                >
                  Absteigend
                </Button>
                <Button
                  variant={filters.sortOrder === "asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ sortOrder: "asc" })}
                  className="flex-1 text-xs"
                >
                  Aufsteigend
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.minRating > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.minRating}+ ⭐
            </Badge>
          )}
          {filters.minReviews > 0 && (
            <Badge variant="secondary" className="text-xs">
              {filters.minReviews}+ Bewertungen
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
