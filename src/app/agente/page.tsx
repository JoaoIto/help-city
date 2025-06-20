"use client"

import {useEffect, useState} from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ArrowLeft, MapPin, TrendingUp, AlertTriangle, Shield, Users, Brain, Filter } from "lucide-react"
import Link from "next/link"
import {useDenuncias} from "@/hooks/useDenuncias";
import {IDenuncia, Severity, StatusDenuncia} from "@/models/IDenuncia";
import {useRouter} from "next/navigation";

export default function AgentePage() {
    const router = useRouter()
    const [filtroRisco, setFiltroRisco] = useState<Severity | "todos">("todos");
    const [filtroStatus, setFiltroStatus] = useState<StatusDenuncia | "todos">("todos");
    const { loading, error, getAll, getByFilter } = useDenuncias();
    const [denuncias, setDenuncias] = useState<IDenuncia[]>([]);

    useEffect(() => {
        async function load() {
            const data = await getAll();
            setDenuncias(data);
        }
        load();
    }, [getAll]);

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
        const okRisco = filtroRisco === "todos" || d.risco === filtroRisco;
        const okStatus = filtroStatus === "todos" || d.status === filtroStatus;
        return okRisco && okStatus;
    });

    // 1) Agrupa denúncias por região (endereço) e calcula stats
    const statsByRegion = denuncias.reduce((acc, d) => {
        // usa só até a vírgula do endereço (ex: "Asa Norte, próximo ...")
        const region = d.endereco?.split(",")[0].trim() || "Sem região";
        if (!acc[region]) {
            acc[region] = {
                region,
                count: 0,
                riscos: [] as (Severity | undefined)[]
            };
        }
        acc[region].count++;
        acc[region].riscos.push(d.risco);
        return acc;
    }, {} as Record<string, { region: string; count: number; riscos: (Severity | undefined)[] }>);

    // 2) Separa por quantidade de ocorrências definindo críticalidade
    function inferRiscoByCount(count: number): Severity {
        if (count >= 50) return "critico";
        if (count >= 30) return "alto";
        if (count >= 10) return "medio";
        return "baixo";
    }

    // 3) Converte para array e ordena pelas maiores ocorrências
    const pontosQuentes = Object.values(statsByRegion)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((stat) => ({
            nome: stat.region,
            ocorrencias: stat.count,
            risco: inferRiscoByCount(stat.count),
        }));

    const routerEditDenuncia = (id: string) => {
        router.push(`/agente/denuncia/${id}`)
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
                                    <p className="text-3xl font-bold text-red-600">{denuncias.filter(d => d.risco === 'critico').length}</p>
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
                                    <p className="text-3xl font-bold text-green-600">89%</p>
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
                                    <p className="text-sm font-medium text-gray-600">Tempo Resposta</p>
                                    <p className="text-3xl font-bold text-blue-600">24h</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <p className="text-sm text-blue-600 mt-2">Média atual</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="mapa" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger className="cursor-pointer" value="mapa">Mapa Preditivo</TabsTrigger>
                        <TabsTrigger className="cursor-pointer" value="denuncias">Denúncias</TabsTrigger>
                        <TabsTrigger className="cursor-pointer" value="analise">Análise IA</TabsTrigger>
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
                                <Button className="cursor-pointer border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-2xl">Vizualisar Mapa</Button>
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
                                                    <p className="text-sm text-gray-600">{ponto.ocorrencias} ocorrências este mês</p>
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
                                        <Select value={filtroRisco} onValueChange={setFiltroRisco}>
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
                                        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
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
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge className={getRiscoColor(denuncia.risco ? denuncia.risco : '')}>
                                                        {denuncia.risco ? (denuncia.risco.replace("-", " ").toUpperCase()) : '' }
                                                    </Badge>
                                                    <Badge variant="outline" className={getStatusColor(denuncia.status)}>
                                                        {denuncia.status.replace("-", " ").toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <h4 className="font-semibold mb-2">{denuncia.descricao}</h4>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{denuncia.endereco}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{denuncia.createdAt}</span>
                                                </div>
                                            </div>
                                            <Button className="cursor-pointer bg-blue-600 text-white" onClick={() => {routerEditDenuncia(denuncia._id)}} variant="outline" size="sm">
                                                Ver Detalhes
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <div className="space-y-4 flex items-center justify-center text-center">
                            {!denunciasFiltradas.length && (
                                <div className="space-y-4 flex flex-col items-center justify-center text-center">
    <span className="text-red-600 text-4xl">
      Não há denúncias desse tipo!
    </span>
                                    <Button
                                        className="cursor-pointer border-2 bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-white text-2xl"
                                        variant="outline"
                                        onClick={() => {
                                            setFiltroRisco("todos");
                                            setFiltroStatus("todos");
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
                                <CardDescription>Insights e previsões baseadas em machine learning</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-blue-900 mb-2">Padrão Temporal</h4>
                                        <p className="text-sm text-blue-800">
                                            Pico de ocorrências entre 20h-23h nos finais de semana. Recomenda-se reforço policial nestes
                                            horários.
                                        </p>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-red-900 mb-2">Área de Risco</h4>
                                        <p className="text-sm text-red-800">
                                            Ceilândia Norte apresenta 67% de probabilidade de nova ocorrência nas próximas 48h.
                                        </p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-green-900 mb-2">Efetividade</h4>
                                        <p className="text-sm text-green-800">
                                            Intervenções baseadas em IA reduziram ocorrências em 34% nas áreas monitoradas.
                                        </p>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-yellow-900 mb-2">Recomendação</h4>
                                        <p className="text-sm text-yellow-800">
                                            Implementar patrulhamento preventivo em Samambaia Sul baseado em análise de clusters.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="font-semibold mb-4">Métricas do Modelo</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">89%</div>
                                            <div className="text-sm text-gray-600">Precisão</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">92%</div>
                                            <div className="text-sm text-gray-600">Recall</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">0.87</div>
                                            <div className="text-sm text-gray-600">F1-Score</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">15ms</div>
                                            <div className="text-sm text-gray-600">Latência</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
