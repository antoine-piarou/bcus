"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload } from "lucide-react"

interface CoachFormProps {
  coachId?: string
  initialData?: any
}

export function CoachForm({ coachId, initialData }: CoachFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    photo_url: initialData?.photo_url || "",
  })

  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `coach-photos/${fileName}`

    setUploading(true)

    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("assets").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data } = supabase.storage.from("assets").getPublicUrl(filePath)

      if (data) {
        setFormData((prev) => ({ ...prev, photo_url: data.publicUrl }))
        setPhotoPreview(data.publicUrl)
      }

      toast({
        title: "Photo téléchargée",
        description: "La photo a été téléchargée avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const coachData = {
        name: formData.name,
        photo_url: formData.photo_url || null,
      }

      let error

      if (coachId) {
        // Update existing coach
        const { error: updateError } = await supabase.from("coaches").update(coachData).eq("id", coachId)
        error = updateError
      } else {
        // Insert new coach
        const { error: insertError } = await supabase.from("coaches").insert([coachData])
        error = insertError
      }

      if (error) {
        throw error
      }

      toast({
        title: coachId ? "Coach mis à jour" : "Coach créé",
        description: coachId ? "Le coach a été mis à jour avec succès" : "Le coach a été créé avec succès",
      })

      router.push("/dashboard/teams")
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
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du coach</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Fanny / Jason"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">Photo</Label>
          <div className="flex items-center gap-4">
            {photoPreview && (
              <div className="w-24 h-32 relative">
                <img
                  src={photoPreview || "/placeholder.svg"}
                  alt="Photo preview"
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <Label
              htmlFor="photo-upload"
              className="cursor-pointer flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Téléchargement..." : "Télécharger une photo"}</span>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/teams")}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : coachId ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  )
}

