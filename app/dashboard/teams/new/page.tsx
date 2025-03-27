import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TeamForm } from "@/components/teams/team-form"

export default async function NewTeamPage() {
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
        <h1 className="text-3xl font-bold">Nouvelle équipe</h1>
        <div className="border rounded-md p-6">
          <TeamForm />
        </div>
      </div>
    </DashboardLayout>
  )
}

