"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Download } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import html2canvas from "html2canvas"

interface SummaryPreviewProps {
  matchData: any
  coachId: string
  summary: string
}

export function SummaryPreview({ matchData, coachId, summary }: SummaryPreviewProps) {
  const [coach, setCoach] = useState<any>(null)
  const [homeTeam, setHomeTeam] = useState<any>(null)
  const [awayTeam, setAwayTeam] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchData() {
      if (coachId) {
        const { data } = await supabase.from("coaches").select("*").eq("id", coachId).single()
        setCoach(data)
      }

      if (matchData.home_team_id) {
        const { data } = await supabase.from("teams").select("*").eq("id", matchData.home_team_id).single()
        setHomeTeam(data)
      }

      if (matchData.away_team_id) {
        const { data } = await supabase.from("teams").select("*").eq("id", matchData.away_team_id).single()
        setAwayTeam(data)
      }
    }

    fetchData()
  }, [coachId, matchData.home_team_id, matchData.away_team_id])

  const handleDownload = async () => {
    try {
      const element = document.getElementById("summary-preview")
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
      })

      const image = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = image
      link.download = `BCUS-${matchData.division}-${format(new Date(matchData.date), "dd-MM-yyyy")}.png`
      link.click()

      toast({
        title: "Téléchargement réussi",
        description: "Le visuel a été téléchargé avec succès",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      })
    }
  }

  const paragraphs = summary.split("\n").filter((p) => p.trim() !== "")

  return (
    <div className="space-y-4">
      <div
        id="summary-preview"
        className="relative w-full aspect-square bg-white overflow-hidden"
        style={{ maxWidth: "600px", margin: "0 auto" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-black to-gray-800 text-white p-4">
          <div className="text-2xl font-bold">{coach ? coach.name : "Coach"}</div>
          <div className="bg-red-600 px-4 py-1 text-xl font-bold rounded-sm">{matchData.division || "Division"}</div>
        </div>

        {/* Date */}
        <div className="absolute top-16 right-4 bg-black text-white px-3 py-1">
          {matchData.date ? format(new Date(matchData.date), "d MMMM", { locale: fr }) : "Date"}
        </div>

        {/* Coach Photo */}
        <div className="absolute left-4 top-24 w-1/3">
          {coach && coach.photo_url ? (
            <img
              src={coach.photo_url || "/placeholder.svg"}
              alt={coach.name}
              className="w-full aspect-[3/4] object-cover border-2 border-white"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-gray-200 flex items-center justify-center border-2 border-white">
              <span className="text-gray-400">Photo</span>
            </div>
          )}
        </div>

        {/* Summary Text */}
        <div className="absolute right-4 top-24 w-3/5 max-h-[50%] overflow-y-auto pr-2 text-sm">
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-gray-400">Résumé du match...</p>
          )}
        </div>

        {/* Team Logos and Score */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between items-center">
          {/* Home Team Logo */}
          <div className="w-1/4 p-2">
            {homeTeam && homeTeam.logo_url ? (
              <img src={homeTeam.logo_url || "/placeholder.svg"} alt={homeTeam.name} className="w-full" />
            ) : (
              <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Logo</span>
              </div>
            )}
          </div>

          {/* Score */}
          <div className="w-2/4 bg-black text-red-600 text-center py-4">
            <div className="text-3xl font-bold">Score</div>
            {matchData.home_score !== null && matchData.away_score !== null && (
              <div className="text-2xl font-bold text-white">
                {matchData.home_score} - {matchData.away_score}
              </div>
            )}
          </div>

          {/* Away Team Logo */}
          <div className="w-1/4 p-2">
            {awayTeam && awayTeam.logo_url ? (
              <img src={awayTeam.logo_url || "/placeholder.svg"} alt={awayTeam.name} className="w-full" />
            ) : (
              <div className="w-full aspect-square bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Logo</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Télécharger l'image
        </Button>
      </div>
    </div>
  )
}

