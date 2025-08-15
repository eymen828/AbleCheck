"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AccessibilitySettings } from "@/components/accessibility-settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileSettings } from "@/components/profile-settings"
import { AppInfoDialog } from "@/components/app-info-dialog"
import { CheckInHelpDialog } from "@/components/check-in-help-dialog"
import { supabase } from "@/lib/supabase"
import { 
	ChevronLeft,
	Settings,
	Info,
	Shield,
	PlayCircle,
	User,
	LogOut,
	LogIn
} from "lucide-react"

export default function SettingsPage() {
	const [user, setUser] = useState<any>(null)
	const [showAppInfo, setShowAppInfo] = useState(false)
	const [showCheckInHelp, setShowCheckInHelp] = useState(false)
	const [showOnboarding, setShowOnboarding] = useState(false)

	useEffect(() => {
		const load = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
		}
		load()
	}, [])

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b bg-card">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2 text-sm">
						<ChevronLeft className="w-4 h-4" />
						Zurück
					</Link>
					<div className="flex items-center gap-2">
						<Settings className="w-5 h-5" />
						<h1 className="text-lg font-semibold">Einstellungen</h1>
					</div>
					<div />
				</div>
			</header>

			<main className="container mx-auto px-4 py-6 space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Anzeige & Barrierefreiheit</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<span>Barrierefreiheit</span>
							<AccessibilitySettings />
						</div>
						<div className="flex items-center justify-between">
							<span>Theme</span>
							<ThemeToggle />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>App</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Button variant="outline" size="sm" onClick={() => setShowAppInfo(true)} className="gap-2">
								<Info className="w-4 h-4" />
								App-Infos
							</Button>
							<Button variant="outline" size="sm" onClick={() => setShowCheckInHelp(true)} className="gap-2">
								<Shield className="w-4 h-4" />
								Check-In Hilfe
							</Button>
							<Button variant="outline" size="sm" onClick={() => setShowOnboarding(true)} className="gap-2">
								<PlayCircle className="w-4 h-4" />
								Onboarding wiederholen
							</Button>
						</div>
					</CardContent>
				</Card>

				{user && (
					<Card>
						<CardHeader>
							<CardTitle>Profil</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<ProfileSettings user={user} onProfileUpdate={() => {}} />
							<Separator />
							<Button variant="outline" size="sm" className="gap-2" onClick={() => supabase.auth.signOut()}>
								<LogOut className="w-4 h-4" />
								Abmelden
							</Button>
						</CardContent>
					</Card>
				)}

				{!user && (
					<Card>
						<CardHeader>
							<CardTitle>Konto</CardTitle>
						</CardHeader>
						<CardContent>
							<Button asChild>
								<Link href="/">
									<LogIn className="w-4 h-4 mr-2" />
									Anmelden
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}

				<AppInfoDialog open={showAppInfo} onOpenChange={setShowAppInfo} />
				<CheckInHelpDialog open={showCheckInHelp} onOpenChange={setShowCheckInHelp} />
			</main>
		</div>
	)
}