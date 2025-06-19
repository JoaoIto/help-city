import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Cidadão Mais Seguro - Plataforma de IA Preditiva",
    description:
        "Plataforma de Inteligência Artificial Preditiva para Monitoramento e Tratamento de Desordens Urbanas com Foco em Segurança Pública",
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
        <body className={inter.className}>{children}</body>
        </html>
    )
}
