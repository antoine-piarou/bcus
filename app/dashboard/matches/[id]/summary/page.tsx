import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SummaryForm } from "@/components/summaries/summary-form"

export default async function MatchSummaryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: match, error } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:home_team_id(name, logo_url),
      away_team:away_team_id(name, logo_url)
    `)
    .eq("id", params.id)
    .single()

  if (error || !match) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Résumé du match</h1>

        <div className="bg-muted/40 p-4 rounded-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-medium">{match.home_team?.name || "Équipe domicile"}</div>
              {match.home_score !== null && <div className="text-2xl font-bold">{match.home_score}</div>}
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm text-muted-foreground">{match.division}</div>
              <div className="text-sm text-muted-foreground">{match.date}</div>
            </div>
            <div>
              <div className="font-medium">{match.away_team?.name || "Équipe extérieur"}</div>
              {match.away_score !== null && <div className="text-2xl font-bold">{match.away_score}</div>}
            </div>
          </div>
        </div>

        <div className="border rounded-md p-6">
          <SummaryForm matchId={params.id} matchData={match} />
        </div>
      </div>
    </DashboardLayout>
  )
}

