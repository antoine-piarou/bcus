import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, Users, Image, PlusCircle } from "lucide-react"

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Vérifier si l'utilisateur est connecté
  if (!session) {
    redirect("/")
  }

  console.log("Session dans Dashboard:", session)

  // Get counts from database with error handling
  let matchesCount = 0
  let teamsCount = 0
  let summariesCount = 0

  try {
    const { count: matchCount, error: matchError } = await supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
    if (!matchError) matchesCount = matchCount || 0

    const { count: teamCount, error: teamError } = await supabase
      .from("teams")
      .select("*", { count: "exact", head: true })
    if (!teamError) teamsCount = teamCount || 0

    const { count: summaryCount, error: summaryError } = await supabase
      .from("match_summaries")
      .select("*", { count: "exact", head: true })
    if (!summaryError) summariesCount = summaryCount || 0
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Button asChild>
            <Link href="/dashboard/matches/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau match
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Matchs</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchesCount}</div>
              <p className="text-xs text-muted-foreground">Matchs enregistrés</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Équipes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamsCount}</div>
              <p className="text-xs text-muted-foreground">Équipes enregistrées</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Résumés</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summariesCount}</div>
              <p className="text-xs text-muted-foreground">Visuels générés</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Matchs récents</CardTitle>
              <CardDescription>Les derniers matchs enregistrés</CardDescription>
            </CardHeader>
            <CardContent>
              {matchesCount === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Aucun match enregistré</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/matches/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Ajouter un match
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Button asChild>
                    <Link href="/dashboard/matches">Voir tous les matchs</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Résumés récents</CardTitle>
              <CardDescription>Les derniers résumés générés</CardDescription>
            </CardHeader>
            <CardContent>
              {summariesCount === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Aucun résumé généré</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/matches">Générer un résumé</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Button asChild>
                    <Link href="/dashboard/summaries">Voir tous les résumés</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

