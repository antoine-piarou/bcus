import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, FileUp, Eye, Pencil } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default async function MatchesPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/")
  }

  // Get matches with team names
  const { data: matches, error } = await supabase
    .from("matches")
    .select(`
      *,
      home_team:home_team_id(name),
      away_team:away_team_id(name)
    `)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching matches:", error)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Matchs</h1>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/matches/import">
                <FileUp className="mr-2 h-4 w-4" />
                Importer
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/matches/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nouveau match
              </Link>
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Équipe domicile</TableHead>
                <TableHead>Équipe extérieur</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches && matches.length > 0 ? (
                matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell>{format(new Date(match.date), "dd/MM/yyyy", { locale: fr })}</TableCell>
                    <TableCell>{match.division || "-"}</TableCell>
                    <TableCell>{match.home_team?.name || "-"}</TableCell>
                    <TableCell>{match.away_team?.name || "-"}</TableCell>
                    <TableCell>
                      {match.home_score !== null && match.away_score !== null
                        ? `${match.home_score} - ${match.away_score}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/dashboard/matches/${match.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Voir</span>
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/dashboard/matches/${match.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Link>
                        </Button>
                        <Button asChild size="icon" variant="ghost">
                          <Link href={`/dashboard/matches/${match.id}/summary`}>
                            <PlusCircle className="h-4 w-4" />
                            <span className="sr-only">Ajouter un résumé</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <div className="text-muted-foreground">Aucun match enregistré</div>
                    <Button asChild className="mt-4">
                      <Link href="/dashboard/matches/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Ajouter un match
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}

