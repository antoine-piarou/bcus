import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MatchForm } from "@/components/matches/match-form"

export default async function EditMatchPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  const { data: match, error } = await supabase.from("matches").select("*").eq("id", params.id).single()

  if (error || !match) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Modifier le match</h1>
        <div className="border rounded-md p-6">
          <MatchForm matchId={params.id} initialData={match} />
        </div>
      </div>
    </DashboardLayout>
  )
}

