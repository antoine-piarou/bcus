import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import { AuthForm } from "@/components/auth/auth-form"

export default async function Home() {
  // Vérifier la session côté serveur
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Si l'utilisateur est déjà connecté, rediriger vers le tableau de bord
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <Image src="/bcus-logo.png" alt="BCUS Logo" width={120} height={120} className="rounded-full" />
        </div>
        <h1 className="text-3xl font-bold text-primary">BCUS Match Summary Generator</h1>
        <p className="text-gray-600 mt-2">Générez facilement des visuels pour les résumés de matchs</p>
      </div>
      <AuthForm />
    </div>
  )
}

