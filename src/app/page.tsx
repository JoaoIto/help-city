"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Shield, Users, MapPin, Brain, Camera } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">Help City - CPTED</h1>
                        </div>
                        <div className="text-sm text-gray-600">Plataforma de IA Preditiva para Segurança Pública</div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-600 mb-6">Cidade Mais <h2 className="text-blue-600 text-6xl"> Segura! </h2></h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                        Uma plataforma inteligente que conecta cidadãos e agentes públicos para identificar, monitorar e prevenir
                        riscos à segurança pública através de IA preditiva.
                    </p>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-black">Denúncias Visuais</h3>
                            <p className="text-gray-600">Cidadãos podem reportar situações de risco com fotos e localização</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <Brain className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-black">IA Preditiva</h3>
                            <p className="text-gray-600">Análise inteligente para identificar padrões e prever riscos</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-black">Mapa 3D Interativo</h3>
                            <p className="text-gray-600">Visualização geoespacial dos pontos críticos de Brasília</p>
                        </div>
                    </div>

                    {/* User Type Selection */}
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="text-center">
                                <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                                <CardTitle className="text-2xl text-black">Sou Cidadão</CardTitle>
                                <CardDescription className="text-lg text-gray-600">
                                    Quero reportar uma situação de risco na minha cidade
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/cidadao">
                                    <Button className="w-full cursor-pointer text-white bg-blue-600 hover:bg-blue-700 text-lg py-6">Fazer Denúncia</Button>
                                </Link>
                                <div className="mt-4 text-sm text-gray-600">
                                    • Envie fotos do local • Compartilhe sua localização • Descreva a situação
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-shadow">
                            <CardHeader className="text-center">
                                <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
                                <CardTitle className="text-2xl text-black">Sou Agente Público</CardTitle>
                                <CardDescription className="text-lg text-gray-600">Quero monitorar e analisar os dados de segurança</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/agente">
                                    <Button className="w-full cursor-pointer text-white bg-green-600 hover:bg-green-700 text-lg py-6">Acessar Dashboard</Button>
                                </Link>
                                <div className="mt-4 text-sm text-gray-600">
                                    • Visualize mapa 3D interativo • Analise dados preditivos • Identifique pontos críticos
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">Impacto da Plataforma</h3>
                        <p className="text-lg text-gray-600">Dados simulados baseados em implementações similares</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">2,847</div>
                            <div className="text-gray-600">Denúncias Recebidas</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">89%</div>
                            <div className="text-gray-600">Precisão da IA</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-red-600 mb-2">156</div>
                            <div className="text-gray-600">Pontos Críticos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">24h</div>
                            <div className="text-gray-600">Tempo de Resposta</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                        <Shield className="h-6 w-6" />
                        <span className="text-lg font-semibold">Cidadão Mais Seguro</span>
                    </div>
                    <p className="text-gray-400">Desenvolvido para o Desafio CPBR17 - Inovação em Segurança Pública</p>
                </div>
            </footer>
        </div>
    )
}
