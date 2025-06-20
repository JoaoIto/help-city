"use client"

import { useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Error({
                                  error,
                                  reset,
                              }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const router = useRouter()

    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                    <CardTitle className="text-2xl text-red-800">Erro ao Carregar</CardTitle>
                    <CardDescription>Não foi possível carregar os detalhes da denúncia. Tente novamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-red-800">
                            <strong>Erro:</strong> {error.message}
                        </p>
                        {error.digest && <p className="text-xs text-red-600 mt-1">ID: {error.digest}</p>}
                    </div>

                    <div className="flex space-x-2">
                        <Button onClick={reset} className="cursor-pointer flex-1">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tentar Novamente
                        </Button>
                        <Button className="bg-blue-600 text-white cursor-pointer" variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
