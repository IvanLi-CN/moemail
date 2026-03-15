"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Github, Loader2 } from "lucide-react"

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const t = useTranslations("auth.loginForm")

  const handleGithubLogin = async () => {
    setLoading(true)
    await signIn("github", { callbackUrl: "/" })
  }

  return (
    <Card className="w-[95%] max-w-lg border-2 border-primary/20">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl text-center bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          {t("title")}
        </CardTitle>
        <CardDescription className="text-center">
          {t("subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6">
        <p className="text-sm text-center text-muted-foreground">
          {t("actions.githubOnlyHint")}
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGithubLogin}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          {t("actions.githubLogin")}
        </Button>
      </CardContent>
    </Card>
  )
}
