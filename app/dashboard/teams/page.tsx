import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function TeamsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get teams
  const { data: teams, error: teamsError } = await supabase.from("teams").select("*").order("name")

  // Get coaches
  const { data: coaches, error: coachesError } = await supabase.from("coaches").select("*").order("name")

  if (teamsError) {
    console.error("Error fetching teams:", teamsError)
  }

  if (coachesError) {
    console.error("Error fetching coaches:", coachesError)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Équipes & Coachs</h1>

        <Tabs defaultValue="teams">
          <TabsList>
            <TabsTrigger value="teams">Équipes</TabsTrigger>
            <TabsTrigger value="coaches">Coachs</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/dashboard/teams/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvelle équipe
                </Link>
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams && teams.length > 0 ? (
                    teams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell>{team.category}</TableCell>
                        <TableCell>
                          {team.logo_url ? (
                            <div className="w-10 h-10 relative">
                              <img
                                src={team.logo_url || "/placeholder.svg"}
                                alt={team.name}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          ) : (
                            "Aucun logo"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/dashboard/teams/${team.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Modifier</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        <div className="text-muted-foreground">Aucune équipe enregistrée</div>
                        <Button asChild className="mt-4">
                          <Link href="/dashboard/teams/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter une équipe
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="coaches" className="space-y-4">
            <div className="flex justify-end">
              <Button asChild>
                <Link href="/dashboard/coaches/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouveau coach
                </Link>
              </Button>
            </div>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Photo</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coaches && coaches.length > 0 ? (
                    coaches.map((coach) => (
                      <TableRow key={coach.id}>
                        <TableCell className="font-medium">{coach.name}</TableCell>
                        <TableCell>
                          {coach.photo_url ? (
                            <div className="w-10 h-10 relative rounded-full overflow-hidden">
                              <img
                                src={coach.photo_url || "/placeholder.svg"}
                                alt={coach.name}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            "Aucune photo"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button asChild size="icon" variant="ghost">
                            <Link href={`/dashboard/coaches/${coach.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Modifier</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-6">
                        <div className="text-muted-foreground">Aucun coach enregistré</div>
                        <Button asChild className="mt-4">
                          <Link href="/dashboard/coaches/new">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Ajouter un coach
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

