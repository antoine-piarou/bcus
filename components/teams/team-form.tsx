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

interface TeamFormProps {
  teamId?: string
  initialData?: any
}

export function TeamForm({ teamId, initialData }: TeamFormProps) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    logo_url: initialData?.logo_url || "",
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `team-logos/${fileName}`

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
        setFormData((prev) => ({ ...prev, logo_url: data.publicUrl }))
        setLogoPreview(data.publicUrl)
      }

      toast({
        title: "Logo téléchargé",
        description: "Le logo a été téléchargé avec succès",
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
      const teamData = {
        name: formData.name,
        category: formData.category,
        logo_url: formData.logo_url || null,
      }

      let error

      if (teamId) {
        // Update existing team
        const { error: updateError } = await supabase.from("teams").update(teamData).eq("id", teamId)
        error = updateError
      } else {
        // Insert new team
        const { error: insertError } = await supabase.from("teams").insert([teamData])
        error = insertError
      }

      if (error) {
        throw error
      }

      toast({
        title: teamId ? "Équipe mise à jour" : "Équipe créée",
        description: teamId ? "L'équipe a été mise à jour avec succès" : "L'équipe a été créée avec succès",
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom de l'équipe</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: BCUS SAINT LEONARD"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Ex: U11F, DMU13, etc."
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="logo">Logo</Label>
          <div className="flex items-center gap-4">
            {logoPreview && (
              <div className="w-16 h-16 relative">
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo preview"
                  className="object-contain w-full h-full"
                />
              </div>
            )}
            <Label
              htmlFor="logo-upload"
              className="cursor-pointer flex items-center gap-2 border rounded-md px-4 py-2 hover:bg-muted"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Téléchargement..." : "Télécharger un logo"}</span>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
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
          {loading ? "Enregistrement..." : teamId ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </form>
  )
}

