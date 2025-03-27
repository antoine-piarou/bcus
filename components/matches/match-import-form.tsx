"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileText, Check, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format, parse } from "date-fns"

export function MatchImportForm() {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null)
      setPreviewData([])
      return
    }

    const selectedFile = e.target.files[0]
    setFile(selectedFile)

    // Preview the file content
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        if (event.target?.result) {
          // Parse the file content (assuming it's a CSV or similar format)
          const content = event.target.result as string
          const lines = content.split("\n").filter((line) => line.trim() !== "")

          // Skip header line
          const dataLines = lines.slice(1)

          const parsedData = dataLines.map((line) => {
            const columns = line.split(",").map((col) => col.trim())
            return {
              division: columns[0] || "",
              match_number: columns[1] || "",
              home_team: columns[2] || "",
              away_team: columns[3] || "",
              date: columns[4] || "",
              time: columns[5] || "",
              location: columns[6] || "",
            }
          })

          setPreviewData(parsedData.slice(0, 5)) // Show first 5 rows as preview
        }
      } catch (error) {
        console.error("Error parsing file:", error)
        toast({
          title: "Erreur",
          description: "Impossible de lire le fichier. Vérifiez le format.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier à importer",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setImportStatus("idle")
    setStatusMessage("")

    try {
      const reader = new FileReader()

      reader.onload = async (event) => {
        try {
          if (event.target?.result) {
            const content = event.target.result as string
            const lines = content.split("\n").filter((line) => line.trim() !== "")

            // Skip header line
            const dataLines = lines.slice(1)

            // Get existing teams to match or create new ones
            const { data: existingTeams } = await supabase.from("teams").select("id, name")

            const teamMap = new Map()
            if (existingTeams) {
              existingTeams.forEach((team) => {
                teamMap.set(team.name.toLowerCase(), team.id)
              })
            }

            // Process each line
            const matchesToInsert = []

            for (const line of dataLines) {
              const columns = line.split(",").map((col) => col.trim())

              if (columns.length < 5) continue

              const division = columns[0]
              const match_number = columns[1]
              const home_team_name = columns[2]
              const away_team_name = columns[3]
              const dateStr = columns[4]
              const timeStr = columns[5] || "00:00"
              const location = columns[6] || ""

              // Create or get team IDs
              let home_team_id = null
              let away_team_id = null

              if (home_team_name) {
                const homeTeamKey = home_team_name.toLowerCase()
                if (teamMap.has(homeTeamKey)) {
                  home_team_id = teamMap.get(homeTeamKey)
                } else {
                  // Create new team
                  const { data: newTeam, error } = await supabase
                    .from("teams")
                    .insert([{ name: home_team_name, category: division }])
                    .select()
                    .single()

                  if (!error && newTeam) {
                    home_team_id = newTeam.id
                    teamMap.set(homeTeamKey, newTeam.id)
                  }
                }
              }

              if (away_team_name) {
                const awayTeamKey = away_team_name.toLowerCase()
                if (teamMap.has(awayTeamKey)) {
                  away_team_id = teamMap.get(awayTeamKey)
                } else {
                  // Create new team
                  const { data: newTeam, error } = await supabase
                    .from("teams")
                    .insert([{ name: away_team_name, category: division }])
                    .select()
                    .single()

                  if (!error && newTeam) {
                    away_team_id = newTeam.id
                    teamMap.set(awayTeamKey, newTeam.id)
                  }
                }
              }

              // Parse date
              let date
              try {
                // Assuming date format is DD/MM/YYYY
                date = parse(`${dateStr} ${timeStr}`, "dd/MM/yyyy HH:mm", new Date())
                date = format(date, "yyyy-MM-dd'T'HH:mm:ss")
              } catch (error) {
                console.error("Error parsing date:", error)
                continue
              }

              // Create match object
              matchesToInsert.push({
                division,
                match_number,
                home_team_id,
                away_team_id,
                date,
                location,
              })
            }

            // Insert matches in batches
            if (matchesToInsert.length > 0) {
              const { error } = await supabase.from("matches").insert(matchesToInsert)

              if (error) {
                throw error
              }

              setImportStatus("success")
              setStatusMessage(`${matchesToInsert.length} matchs importés avec succès`)

              toast({
                title: "Import réussi",
                description: `${matchesToInsert.length} matchs importés avec succès`,
              })

              setTimeout(() => {
                router.push("/dashboard/matches")
                router.refresh()
              }, 2000)
            } else {
              setImportStatus("error")
              setStatusMessage("Aucun match valide à importer")
            }
          }
        } catch (error: any) {
          console.error("Error importing matches:", error)
          setImportStatus("error")
          setStatusMessage(error.message)
          toast({
            title: "Erreur",
            description: error.message,
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }

      reader.readAsText(file)
    } catch (error: any) {
      setLoading(false)
      setImportStatus("error")
      setStatusMessage(error.message)
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="file-upload">Fichier de convocation</Label>
        <div className="flex items-center gap-4">
          <Label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            <span>Sélectionner un fichier</span>
            <Input id="file-upload" type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
          </Label>
          {file && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Format attendu: CSV avec colonnes Division, N° de match, Équipe 1, Équipe 2, Date, Heure, Lieu
        </p>
      </div>

      {previewData.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Aperçu des données</h3>
          <div className="border rounded-md overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Division
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    N° Match
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe domicile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipe extérieur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lieu
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.division}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.match_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.home_team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.away_team}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {row.date} {row.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{row.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground">Affichage des 5 premières lignes uniquement</p>
        </div>
      )}

      {importStatus === "success" && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Import réussi</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      {importStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/matches")}>
          Annuler
        </Button>
        <Button onClick={handleImport} disabled={!file || loading}>
          {loading ? "Importation..." : "Importer"}
        </Button>
      </div>
    </div>
  )
}

