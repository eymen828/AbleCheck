"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Eye, EyeOff, Volume2, Settings, Play, Square } from "lucide-react"
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode"

export function AccessibilitySettings() {
  const { settings, updateSettings, isSupported, isSpeaking, isInitialized, speak, stopSpeaking } =
    useAccessibilityMode()

  const testSpeech = () => {
    const testText = "Dies ist ein Test der Sprachausgabe. Der Blindenmodus funktioniert korrekt."
    speak(testText, true)
  }

  if (!isSupported) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <EyeOff className="w-4 h-4" />
        Nicht unterstützt
      </Button>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          {settings.isBlindModeEnabled ? (
            <>
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Blindenmodus</span>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              <span className="hidden sm:inline">Barrierefreiheit</span>
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Barrierefreiheit
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Status Info */}
          <Card
            className={
              settings.isBlindModeEnabled ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : ""
            }
          >
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {settings.isBlindModeEnabled ? "Blindenmodus aktiv" : "Blindenmodus inaktiv"}
                  </p>
                  <p className="text-sm text-muted-foreground">{isInitialized ? "Bereit" : "Wird initialisiert..."}</p>
                </div>
                {settings.isBlindModeEnabled ? (
                  <Eye className="w-6 h-6 text-green-600" />
                ) : (
                  <EyeOff className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Blind Mode Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {settings.isBlindModeEnabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                Blindenmodus
              </CardTitle>
              <CardDescription className="text-sm">
                Aktiviert Sprachausgabe und Doppelklick-Navigation für bessere Zugänglichkeit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="blind-mode">Blindenmodus aktivieren</Label>
                <Switch
                  id="blind-mode"
                  checked={settings.isBlindModeEnabled}
                  onCheckedChange={(checked) => updateSettings({ isBlindModeEnabled: checked })}
                />
              </div>

              {settings.isBlindModeEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testSpeech}
                      disabled={isSpeaking || !isInitialized}
                      className="flex-1 gap-2"
                    >
                      <Play className="w-4 h-4" />
                      {isSpeaking ? "Spricht..." : "Test"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={stopSpeaking} disabled={!isSpeaking} className="gap-2">
                      <Square className="w-4 h-4" />
                      Stop
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border">
                    <strong>💡 Verwendung:</strong>
                    <br />• <strong>Einmal klicken</strong> = Beschreibung hören
                    <br />• <strong>Zweimal klicken</strong> = Aktion ausführen
                    <br />• <strong>Hover</strong> = Automatische Ansage (optional)
                    <br />• <strong>Formulare</strong> = Automatische Feldansage
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Speech Settings */}
          {settings.isBlindModeEnabled && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Spracheinstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Speech Rate */}
                <div className="space-y-3">
                  <Label>Sprechgeschwindigkeit: {settings.speechRate.toFixed(1)}x</Label>
                  <Slider
                    value={[settings.speechRate]}
                    onValueChange={([value]) => updateSettings({ speechRate: value })}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.5x (Langsam)</span>
                    <span>2x (Schnell)</span>
                  </div>
                </div>

                {/* Speech Volume */}
                <div className="space-y-3">
                  <Label>Lautstärke: {Math.round(settings.speechVolume * 100)}%</Label>
                  <Slider
                    value={[settings.speechVolume]}
                    onValueChange={([value]) => updateSettings({ speechVolume: value })}
                    min={0.1}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>10% (Leise)</span>
                    <span>100% (Laut)</span>
                  </div>
                </div>

                {/* Double Click Delay */}
                <div className="space-y-3">
                  <Label>Doppelklick-Verzögerung: {settings.doubleClickDelay}ms</Label>
                  <Slider
                    value={[settings.doubleClickDelay]}
                    onValueChange={([value]) => updateSettings({ doubleClickDelay: value })}
                    min={200}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>200ms (Schnell)</span>
                    <span>1000ms (Langsam)</span>
                  </div>
                </div>

                {/* Announce on Hover */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="announce-hover" className="text-sm">
                      Ansage beim Überfahren
                    </Label>
                    <p className="text-xs text-muted-foreground">Elemente werden beim Hover vorgelesen</p>
                  </div>
                  <Switch
                    id="announce-hover"
                    checked={settings.announceOnHover}
                    onCheckedChange={(checked) => updateSettings({ announceOnHover: checked })}
                  />
                </div>

                {/* Test Button */}
                <Button
                  onClick={testSpeech}
                  disabled={isSpeaking || !isInitialized}
                  className="w-full gap-2"
                  variant="secondary"
                >
                  <Volume2 className="w-4 h-4" />
                  {isSpeaking ? "Test läuft..." : "Sprachtest starten"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Debug Info (nur in Development) */}
          {process.env.NODE_ENV === "development" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-1">
                <p>Unterstützt: {isSupported ? "✅" : "❌"}</p>
                <p>Initialisiert: {isInitialized ? "✅" : "❌"}</p>
                <p>Spricht: {isSpeaking ? "✅" : "❌"}</p>
                <p>
                  Stimmen:{" "}
                  {typeof window !== "undefined" && window.speechSynthesis
                    ? window.speechSynthesis.getVoices().length
                    : 0}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
