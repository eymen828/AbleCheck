"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Filter, ChevronRight, ChevronDown } from "lucide-react"
import { 
  placeCategories, 
  type Category,
  getCategoryById,
  getCategoryColor 
} from "@/lib/categories"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

interface CategorySelectorProps {
  selectedCategories: string[]
  onCategoryChange: (categories: string[]) => void
  disabled?: boolean
}

export function CategorySelector({ 
  selectedCategories, 
  onCategoryChange, 
  disabled = false 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const { handleAccessibleClick, announceAction } = useAccessibilityMode()

  const toggleCategory = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId]
    
    onCategoryChange(newCategories)
    
    const category = getCategoryById(categoryId)
    announceAction(
      selectedCategories.includes(categoryId) 
        ? `Kategorie ${category?.name} entfernt` 
        : `Kategorie ${category?.name} hinzugefügt`
    )
  }

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories((prev: string[]) => 
      prev.includes(categoryId)
        ? prev.filter((id: string) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const clearCategories = () => {
    onCategoryChange([])
    announceAction("Alle Kategorien entfernt")
  }

  const getSelectedCategoryNames = () => {
    return selectedCategories
      .map(id => getCategoryById(id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <>
      {/* Mobile Category Selector */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Kategorien
              {selectedCategories.length > 0 && (
                                 <Badge variant="secondary" className="ml-1">
                   {selectedCategories.length}
                 </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Kategorien auswählen</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-full pr-4">
              <MobileCategoryList
                categories={placeCategories}
                selectedCategories={selectedCategories}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
                onToggleExpanded={toggleExpanded}
              />
            </ScrollArea>
            {selectedCategories.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {selectedCategories.length} Kategorie(n) ausgewählt
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleAccessibleClick(e.currentTarget, clearCategories, "Alle Kategorien löschen")}
                >
                  Alle löschen
                </Button>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Category Selector */}
      <div className="hidden md:block">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Kategorien</CardTitle>
              {selectedCategories.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleAccessibleClick(e.currentTarget, clearCategories, "Alle Kategorien löschen")}
                  className="text-xs"
                >
                  Alle löschen
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <DesktopCategoryList
                categories={placeCategories}
                selectedCategories={selectedCategories}
                expandedCategories={expandedCategories}
                onToggleCategory={toggleCategory}
                onToggleExpanded={toggleExpanded}
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Selected Categories Display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedCategories.map(categoryId => {
            const category = getCategoryById(categoryId)
            if (!category) return null
            
            return (
                             <Badge
                 key={categoryId}
                 variant="secondary"
                 className="flex items-center gap-1"
                 style={{ backgroundColor: `${category.color}20`, borderColor: category.color }}
               >
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={(e) => handleAccessibleClick(
                    e.currentTarget, 
                    () => toggleCategory(categoryId), 
                    `Kategorie ${category.name} entfernen`
                  )}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </>
  )
}

function MobileCategoryList({
  categories,
  selectedCategories,
  expandedCategories,
  onToggleCategory,
  onToggleExpanded
}: {
  categories: Category[]
  selectedCategories: string[]
  expandedCategories: string[]
  onToggleCategory: (id: string) => void
  onToggleExpanded: (id: string) => void
}) {
  const { handleAccessibleClick } = useAccessibilityMode()

  return (
    <div className="space-y-2">
      {categories.map(category => (
        <div key={category.id} className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onToggleCategory(category.id)}
                aria-label={`Kategorie ${category.name} auswählen`}
              />
              <div className="flex items-center gap-2">
                <span>{category.icon}</span>
                <div>
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.description}</div>
                </div>
              </div>
            </div>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleAccessibleClick(
                  e.currentTarget,
                  () => onToggleExpanded(category.id),
                  `Unterkategorien für ${category.name} ${expandedCategories.includes(category.id) ? 'einklappen' : 'ausklappen'}`
                )}
                className="p-1"
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {category.subcategories && 
           category.subcategories.length > 0 && 
           expandedCategories.includes(category.id) && (
            <div className="ml-6 space-y-1">
              {category.subcategories.map(subcategory => (
                <div key={subcategory.id} className="flex items-center space-x-2 p-2">
                  <Checkbox
                    checked={selectedCategories.includes(subcategory.id)}
                    onCheckedChange={() => onToggleCategory(subcategory.id)}
                    aria-label={`Unterkategorie ${subcategory.name} auswählen`}
                  />
                  <div className="flex items-center gap-2">
                    <span>{subcategory.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{subcategory.name}</div>
                      <div className="text-xs text-muted-foreground">{subcategory.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function DesktopCategoryList({
  categories,
  selectedCategories,
  expandedCategories,
  onToggleCategory,
  onToggleExpanded
}: {
  categories: Category[]
  selectedCategories: string[]
  expandedCategories: string[]
  onToggleCategory: (id: string) => void
  onToggleExpanded: (id: string) => void
}) {
  const { handleAccessibleClick } = useAccessibilityMode()

  return (
    <div className="space-y-1">
      {categories.map(category => (
        <div key={category.id} className="space-y-1">
          <div className="flex items-center justify-between hover:bg-accent rounded p-1">
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => onToggleCategory(category.id)}
                aria-label={`Kategorie ${category.name} auswählen`}
              />
              <div className="flex items-center gap-2 flex-1">
                <span>{category.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">
                    {category.description}
                  </div>
                </div>
              </div>
            </div>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleAccessibleClick(
                  e.currentTarget,
                  () => onToggleExpanded(category.id),
                  `Unterkategorien für ${category.name} ${expandedCategories.includes(category.id) ? 'einklappen' : 'ausklappen'}`
                )}
                className="p-1 ml-2"
              >
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>

          {category.subcategories && 
           category.subcategories.length > 0 && 
           expandedCategories.includes(category.id) && (
            <div className="ml-6 space-y-1">
              {category.subcategories.map(subcategory => (
                <div key={subcategory.id} className="flex items-center space-x-2 hover:bg-accent rounded p-1">
                  <Checkbox
                    checked={selectedCategories.includes(subcategory.id)}
                    onCheckedChange={() => onToggleCategory(subcategory.id)}
                    aria-label={`Unterkategorie ${subcategory.name} auswählen`}
                  />
                  <div className="flex items-center gap-2">
                    <span>{subcategory.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{subcategory.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {subcategory.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}