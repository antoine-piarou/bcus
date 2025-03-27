import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MatchForm } from "@/components/matches/match-form"

export default async function NewMatchPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Nouveau match</h1>
        <div className="border rounded-md p-6">
          <MatchForm />
        </div>
      </div>
    </DashboardLayout>
  )
}

