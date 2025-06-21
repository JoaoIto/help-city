"use client"

import { useEffect, useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ArrowLeft, MapPin, TrendingUp, AlertTriangle, Shield, Users, Brain, Filter } from "lucide-react"
import Link from "next/link"
import { useDenuncias } from "@/hooks/useDenuncias"
import type { IDenuncia, Severity, StatusDenuncia } from "@/models/IDenuncia"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts"
import type { IPredictiveData } from "@/models/IPredictiveData"

export default function AgentePage() {
    const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#6b7280"]
    const router = useRouter()
    const [filtroRisco, setFiltroRisco] = useState<Severity>("todos")
    const [filtroStatus, setFiltroStatus] = useState<StatusDenuncia | "todos">("todos")
    const { getAll } = useDenuncias()
    const [denuncias, setDenuncias] = useState<IDenuncia[]>([])
    const [predictiveData, setPredictiveData] = useState<IPredictiveData | null>(null)
    const [loadingPredictive, setLoadingPredictive] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await getAll()
            setDenuncias(data)
        }
        load()
        loadPredictiveData()
    }, [getAll])

    async function loadPredictiveData() {
        try {
            const endDate = new Date()
            const startDate = new Date()
            startDate.setFullYear(endDate.getFullYear() - 1)

            const res = await fetch(`/api/predictive?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
            if (!res.ok) throw new Error("Falha ao buscar dados preditivos")

            const data = await res.json()
            setPredictiveData(data)
        } catch (err) {
            console.error("Erro ao carregar dados preditivos:", err)
        } finally {
            setLoadingPredictive(false)
        }
    }

    const getRiscoColor = (risco: string) => {
        switch (risco) {
            case "critico":
                return "bg-red-600 text-white"
            case "alto":
                return "bg-orange-500 text-white"
            case "medio":
                return "bg-yellow-500 text-black"
            case "baixo":
                return "bg-green-500 text-white"
            default:
                return "bg-gray-500 text-white"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pendente":
                return "bg-yellow-100 text-yellow-800"
            case "em-analise":
                return "bg-blue-100 text-blue-800"
            case "resolvido":
                return "bg-green-100 text-green-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const denunciasFiltradas = denuncias.filter((d) => {
        const okRisco = filtroRisco === "todos" || d.risco === filtroRisco
        const okStatus = filtroStatus === "todos" || d.status === filtroStatus
        return okRisco && okStatus
    })

    // Preparar dados para gráficos baseados nas denúncias locais
    const riskDistribution = denuncias.reduce<Record<string, number>>((acc, d) => {
        const risk = d.risco || "indefinido"
        acc[risk] = (acc[risk] || 0) + 1
        return acc
    }, {})

    const riskChartData = Object.entries(riskDistribution).map(([level, count]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count,
    }))

    // Distribuição por região
    const regionDistribution = denuncias.reduce<Record<string, number>>((acc, d) => {
        const region = d.endereco?.split(",")[0].trim() || "Sem região"
        acc[region] = (acc[region] || 0) + 1
        return acc
    }, {})

    const regionChartData = Object.entries(regionDistribution)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8) // Top 8 regiões

    // Distribuição por hora
    const hourlyDistribution = denuncias.reduce<Record<number, number>>((acc, d) => {
        const hour = new Date(d.createdAt).getHours()
        acc[hour] = (acc[hour] || 0) + 1
        return acc
    }, {})

    const hourlyChartData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: hourlyDistribution[hour] || 0,
        label: `${hour}:00`,
    }))

    // Distribuição por status
    const statusDistribution = denuncias.reduce<Record<string, number>>((acc, d) => {
        const status = d.status || "indefinido"
        acc[status] = (acc[status] || 0) + 1
        return acc
    }, {})

    const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
        status: status.replace("-", " ").toUpperCase(),
        count,
    }))

    // 1) Agrupa denúncias por região (endereço) e calcula stats
    const statsByRegion = denuncias.reduce(
        (acc, d) => {
            const region = d.endereco?.split(",")[0].trim() || "Sem região"
            if (!acc[region]) {
                acc[region] = {
                    region,
                    count: 0,
                    riscos: [] as (Severity | undefined)[],
                }
            }
            acc[region].count++
            acc[region].riscos.push(d.risco)
            return acc
        },
        {} as Record<string, { region: string; count: number; riscos: (Severity | undefined)[] }>,
    )

    // 2) Separa por quantidade de ocorrências definindo críticalidade
    function inferRiscoByCount(count: number): Severity {
        if (count >= 50) return "critico"
        if (count >= 30) return "alto"
        if (count >= 10) return "medio"
        return "baixo"
    }

    // 3) Converte para array e ordena pelas maiores ocorrências
    const pontosQuentes = Object.values(statsByRegion)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((stat) => ({
            nome: stat.region,
            ocorrencias: stat.count,
            risco: inferRiscoByCount(stat.count),
        }))

    const routerEditDenuncia = (id: string) => {
        router.push(`/agente/denuncia/${id}/status`)
    }

    function routerHelpCityMaps() {
        // Se quiser abrir na mesma aba
        // window.location.href = 'https://help-city-cpted-maps.vercel.app/'
        //
        // Ou, para abrir em nova aba:
        window.open('https://help-city-cpted-maps.vercel.app/', '_blank')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/">
                                <Button className="text-blue-600 cursor-pointer" variant="ghost" size="sm">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Voltar
                                </Button>
                            </Link>
                            <div className="flex items-center space-x-2">
                                <Shield className="h-6 w-6 text-blue-600" />
                                <h1 className="text-2xl font-bold text-gray-900">Dashboard Agente Público</h1>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Sistema Ativo
                        </Badge>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total de Denúncias</p>
                                    <p className="text-3xl font-bold text-gray-900">{denuncias.length}</p>
                                </div>
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-sm text-green-600 mt-2">+12% esta semana</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Risco Alto/Crítico</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {denuncias.filter((d) => d.risco === "critico").length}
                                    </p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <p className="text-sm text-red-600 mt-2">Requer atenção</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Precisão da IA</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {predictiveData ? `${predictiveData.metrics.precision}%` : "89%"}
                                    </p>
                                </div>
                                <Brain className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-sm text-green-600 mt-2">Modelo otimizado</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Latência</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {predictiveData ? `${predictiveData.metrics.latency}ms` : "24ms"}
                                    </p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-sm text-blue-600 mt-2">Tempo de resposta</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="mapa" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger className="cursor-pointer" value="mapa">
                            Mapa Preditivo
                        </TabsTrigger>
                        <TabsTrigger className="cursor-pointer" value="denuncias">
                            Denúncias
                        </TabsTrigger>
                        <TabsTrigger className="cursor-pointer" value="analise">
                            Análise IA
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="mapa" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <MapPin className="h-5 w-5" />
                                    <span>Mapa de Calor - Brasília</span>
                                </CardTitle>
                                <CardDescription>Visualização dos pontos críticos identificados pela IA preditiva</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={routerHelpCityMaps} className="cursor-pointer border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-2xl">
                                    Visualizar Mapa
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pontos Quentes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 5 Pontos Críticos</CardTitle>
                                <CardDescription>Áreas que requerem maior atenção policial</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {pontosQuentes.map((ponto, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                                                <div>
                                                    <h4 className="font-semibold">{ponto.nome}</h4>
                                                    <p className="text-sm text-gray-600">{ponto.ocorrencias} ocorrências</p>
                                                </div>
                                            </div>
                                            <Badge className={getRiscoColor(ponto.risco)}>
                                                {ponto.risco.replace("-", " ").toUpperCase()}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="denuncias" className="space-y-6">
                        {/* Filtros */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Filter className="h-5 w-5" />
                                    <span>Filtros</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="filtro-risco">Nível de Risco</label>
                                        <Select value={filtroRisco} onValueChange={(value: string) => setFiltroRisco(value as Severity)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos os Riscos</SelectItem>
                                                <SelectItem value="critico">Crítico</SelectItem>
                                                <SelectItem value="alto">Alto</SelectItem>
                                                <SelectItem value="medio">Médio</SelectItem>
                                                <SelectItem value="baixo">Baixo</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label htmlFor="filtro-status">Status</label>
                                        <Select
                                            value={filtroStatus}
                                            onValueChange={(value: string) => setFiltroStatus(value as StatusDenuncia)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos os Status</SelectItem>
                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                <SelectItem value="em-analise">Em Análise</SelectItem>
                                                <SelectItem value="resolvido">Resolvido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lista de Denúncias */}
                        <div className="space-y-4">
                            {denunciasFiltradas.map((denuncia) => (
                                <Card key={denuncia._id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-around">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge className={getRiscoColor(denuncia.risco ? denuncia.risco : "")}>
                                                        {denuncia.risco ? denuncia.risco.replace("-", " ").toUpperCase() : ""}
                                                    </Badge>
                                                    <Badge variant="outline" className={getStatusColor(denuncia.status)}>
                                                        {denuncia.status.replace("-", " ").toUpperCase()}
                                                    </Badge>
                                                    <Button
                                                        onClick={() => routerEditDenuncia(denuncia._id)}
                                                        size="icon"
                                                        variant="ghost"
                                                        className="inline-flex sm:hidden p-2"
                                                    >
                                                        <Eye className="h-5 w-5 text-blue-600 cursor-pointer" />
                                                    </Button>
                                                </div>
                                                <h4 className="font-semibold mb-2">{denuncia.descricao}</h4>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{denuncia.endereco}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{new Date(denuncia.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <Button
                                                    onClick={() => routerEditDenuncia(denuncia._id)}
                                                    size="sm"
                                                    className="cursor-pointer hidden sm:inline-flex bg-blue-600 text-white"
                                                >
                                                    Detalhes
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="space-y-4 flex items-center justify-center text-center">
                            {!denunciasFiltradas.length && (
                                <div className="space-y-4 flex flex-col items-center justify-center text-center">
                                    <span className="text-red-600 text-4xl">Não há denúncias desse tipo!</span>
                                    <Button
                                        className="cursor-pointer border-2 bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white text-2xl"
                                        variant="outline"
                                        onClick={() => {
                                            setFiltroRisco("todos")
                                            setFiltroStatus("todos")
                                        }}
                                    >
                                        Limpar filtros
                                    </Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="analise" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Brain className="h-5 w-5" />
                                    <span>Análise Preditiva da IA</span>
                                </CardTitle>
                                <CardDescription>
                                    Insights e previsões baseadas em machine learning
                                    {predictiveData && ` • ${predictiveData.rowCount} registros analisados`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {loadingPredictive ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="p-4 rounded-lg border">
                                                    <Skeleton className="h-5 w-32 mb-2" />
                                                    <Skeleton className="h-16 w-full" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : predictiveData ? (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-blue-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-blue-900 mb-2">Padrão Temporal</h4>
                                                <p className="text-sm text-blue-800">{predictiveData.analysis.temporal}</p>
                                            </div>
                                            <div className="bg-red-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-red-900 mb-2">Área de Risco</h4>
                                                <p className="text-sm text-red-800">{predictiveData.analysis.area}</p>
                                            </div>
                                            <div className="bg-green-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-green-900 mb-2">Efetividade</h4>
                                                <p className="text-sm text-green-800">{predictiveData.analysis.efetividade}</p>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-lg">
                                                <h4 className="font-semibold text-yellow-900 mb-2">Recomendação</h4>
                                                <p className="text-sm text-yellow-800">{predictiveData.analysis.recomendacao}</p>
                                            </div>
                                        </div>

                                        <div className="border-t pt-6">
                                            <h4 className="font-semibold mb-4">Métricas do Modelo</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">{predictiveData.metrics.precision}%</div>
                                                    <div className="text-sm text-gray-600">Precisão</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">{predictiveData.metrics.recall}%</div>
                                                    <div className="text-sm text-gray-600">Recall</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">{predictiveData.metrics.f1Score}</div>
                                                    <div className="text-sm text-gray-600">F1-Score</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-orange-600">{predictiveData.metrics.latency}ms</div>
                                                    <div className="text-sm text-gray-600">Latência</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Gráficos */}
                                        <div className="border-t pt-6 space-y-8">
                                            <h4 className="font-semibold mb-4">Visualizações</h4>

                                            {/* Gráfico de Pizza - Distribuição por Risco */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Distribuição por Nível de Risco</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div style={{ width: "100%", height: 300 }}>
                                                        <ResponsiveContainer>
                                                            <PieChart>
                                                                <Pie
                                                                    data={riskChartData}
                                                                    dataKey="count"
                                                                    nameKey="level"
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    outerRadius={100}
                                                                    label={({ level, count }) => `${level}: ${count}`}
                                                                >
                                                                    {riskChartData.map((_, idx) => (
                                                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Gráfico de Barras - Top Regiões */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Ocorrências por Região</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div style={{ width: "100%", height: 300 }}>
                                                        <ResponsiveContainer>
                                                            <BarChart data={regionChartData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                                                <YAxis />
                                                                <Tooltip />
                                                                <Bar dataKey="count" fill="#3b82f6" />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Gráfico de Linha - Distribuição Horária */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Distribuição por Horário</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div style={{ width: "100%", height: 300 }}>
                                                        <ResponsiveContainer>
                                                            <LineChart data={hourlyChartData}>
                                                                <CartesianGrid strokeDasharray="3 3" />
                                                                <XAxis
                                                                    dataKey="hour"
                                                                    label={{ value: "Hora do Dia", position: "insideBottom", offset: -5 }}
                                                                />
                                                                <YAxis label={{ value: "Ocorrências", angle: -90, position: "insideLeft" }} />
                                                                <Tooltip
                                                                    labelFormatter={(hour) => `${hour}:00`}
                                                                    formatter={(value) => [value, "Ocorrências"]}
                                                                />
                                                                <Line
                                                                    type="monotone"
                                                                    dataKey="count"
                                                                    stroke="#10b981"
                                                                    strokeWidth={2}
                                                                    dot={{ fill: "#10b981" }}
                                                                />
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Gráfico de Pizza - Status */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Distribuição por Status</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div style={{ width: "100%", height: 300 }}>
                                                        <ResponsiveContainer>
                                                            <PieChart>
                                                                <Pie
                                                                    data={statusChartData}
                                                                    dataKey="count"
                                                                    nameKey="status"
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    outerRadius={100}
                                                                    label={({ status, count }) => `${status}: ${count}`}
                                                                >
                                                                    {statusChartData.map((_, idx) => (
                                                                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                                                    ))}
                                                                </Pie>
                                                                <Tooltip />
                                                                <Legend />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">Erro ao carregar dados preditivos</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
