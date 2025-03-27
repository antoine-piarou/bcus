"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

interface Team {
  id: string
  name: string
  category: string
}

interface MatchFormProps {
  matchId?: string
  initialData?: any
}

export function MatchForm({ matchId, initialData }: MatchFormProps) {
  const [loading, setLoading] = useState(false)
  const [teams, setTeams] = useState<Team[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    date: initialData?.date ? format(new Date(initialData.date), "yyyy-MM-dd") : "",
    division: initialData?.division || "",
    match_number: initialData?.match_number || "",
    home_team_id: initialData?.home_team_id || "",
    away_team_id: initialData?.away_team_id || "",
    home_score: initialData?.home_score?.toString() || "",
    away_score: initialData?.away_score?.toString() || '",  || "',
    away_score: initialData?.away_score?.toString() || "",
    location: initialData?.location || "",
  })

  // Fetch teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase.from("teams").select("*").order("name")

      if (error) {
        console.error("Error fetching teams:", error)
        return
      }

      setTeams(data || [])
    }

    fetchTeams()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const matchData = {
        date: formData.date,
        division: formData.division,
        match_number: formData.match_number,
        home_team_id: formData.home_team_id || null,
        away_team_id: formData.away_team_id || null,
        home_score: formData.home_score ? Number.parseInt(formData.home_score) : null,
        away_score: formData.away_score ? Number.parseInt(formData.away_score) : null,
        location: formData.location,
      }

      let error

      if (matchId) {
        // Update existing match
        const { error: updateError } = await supabase.from("matches").update(matchData).eq("id", matchId)
        error = updateError
      } else {
        // Insert new match
        const { error: insertError } = await supabase.from("matches").insert([matchData])
        error = insertError
      }

      if (error) {
        throw error
      }

      toast({
        title: matchId ? "Match mis à jour" : "Match créé",
        description: matchId ? "Le match a été mis à jour avec succès" : "Le match a été créé avec succès",
      })

      router.push("/dashboard/matches")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date">Date du match</Label>
          <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="division">Division</Label>
          <Input
            id="division"
            name="division"
            value={formData.division}
            onChange={handleChange}
            placeholder="Ex: U11F, DMU13, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="match_number">Numéro de match</Label>
          <Input
            id="match_number"
            name="match_number"
            value={formData.match_number}
            onChange={handleChange}
            placeholder="Ex: 53, 190, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Lieu</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ex: GYMNASE MUNICIPAL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_team_id">Équipe domicile</Label>
          <Select value={formData.home_team_id} onValueChange={(value) => handleSelectChange("home_team_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une équipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="away_team_id">Équipe extérieur</Label>
          <Select value={formData.away_team_id} onValueChange={(value) => handleSelectChange("away_team_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une équipe" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name} ({team.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="home_score">Score domicile</Label>
          <Input
            id="home_score"
            name="home_score"
            type="number"
            value={formData.home_score}
            onChange={handleChange}
            placeholder="Score"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="away_score">Score extérieur</Label>
          <Input
            id="away_score"
            name="away_score"
            type="number"
            value={formData.away_score}
            onChange={handleChange}
            placeholder="Score"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/matches")}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : matchId ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  )
}

