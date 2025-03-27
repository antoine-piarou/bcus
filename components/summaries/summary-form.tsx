"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { SummaryPreview } from "@/components/summaries/summary-preview"

interface Coach {
  id: string
  name: string
}

interface SummaryFormProps {
  matchId: string
  matchData: any
}

export function SummaryForm({ matchId, matchData }: SummaryFormProps) {
  const [loading, setLoading] = useState(false)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [existingSummary, setExistingSummary] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    coach_id: "",
    summary: "",
  })

  // Fetch coaches and check for existing summary
  useEffect(() => {
    async function fetchData() {
      // Fetch coaches
      const { data: coachesData, error: coachesError } = await supabase.from("coaches").select("*").order("name")

      if (coachesError) {
        console.error("Error fetching coaches:", coachesError)
      } else {
        setCoaches(coachesData || [])
      }

      // Check for existing summary
      const { data: summaryData, error: summaryError } = await supabase
        .from("match_summaries")
        .select("*")
        .eq("match_id", matchId)
        .single()

      if (!summaryError && summaryData) {
        setExistingSummary(summaryData)
        setFormData({
          coach_id: summaryData.coach_id || "",
          summary: summaryData.summary || "",
        })
      }
    }

    fetchData()
  }, [matchId])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      const summaryData = {
        match_id: matchId,
        coach_id: formData.coach_id || null,
        summary: formData.summary,
      }

      let error

      if (existingSummary) {
        // Update existing summary
        const { error: updateError } = await supabase
          .from("match_summaries")
          .update(summaryData)
          .eq("id", existingSummary.id)
        error = updateError
      } else {
        // Insert new summary
        const { error: insertError } = await supabase.from("match_summaries").insert([summaryData])
        error = insertError
      }

      if (error) {
        throw error
      }

      toast({
        title: existingSummary ? "Résumé mis à jour" : "Résumé créé",
        description: existingSummary ? "Le résumé a été mis à jour avec succès" : "Le résumé a été créé avec succès",
      })

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="coach_id">Coach</Label>
            <Select value={formData.coach_id} onValueChange={(value) => handleSelectChange("coach_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un coach" />
              </SelectTrigger>
              <SelectContent>
                {coaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Résumé du match</Label>
            <Textarea
              id="summary"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Écrivez un résumé du match..."
              className="min-h-[200px]"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/matches")}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : existingSummary ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </div>

      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Aperçu</h3>
        <SummaryPreview matchData={matchData} coachId={formData.coach_id} summary={formData.summary} />
      </div>
    </div>
  )
}

