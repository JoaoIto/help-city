"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { Input } from "@/app/components/ui/input"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Clock,
    User,
    Camera,
    AlertTriangle,
    Edit3,
    Save,
    Phone,
    Mail,
    Shield,
    Brain,
    FileText,
    Navigation,
    Loader2,
} from "lucide-react"
import { useDenuncias } from "@/hooks/useDenuncias"
import {IDenuncia} from "@/models/IDenuncia";

type ReportStatus = "pendente" | "em-analise" | "verificado" | "resolvido" | "falso-positivo"

export default function DenunciaDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { loading, error, getAll, updateStatus } = useDenuncias()

    const [denuncia, setDenuncia] = useState<IDenuncia | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [newStatus, setNewStatus] = useState<ReportStatus>("pendente")
    const [actionNotes, setActionNotes] = useState("")
    const [assignedAgent, setAssignedAgent] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)

    const denunciaId = params.id as string

    // Buscar denúncia específica por ID
    useEffect(() => {
        async function loadDenuncia() {
            try {
                const data = await getAll()
                const foundDenuncia = data.find((d: IDenuncia) => d._id === denunciaId)

                if (foundDenuncia) {
                    setDenuncia(foundDenuncia)
                    setNewStatus(foundDenuncia.status as ReportStatus)
                    setAssignedAgent(foundDenuncia.assignedAgent?.name || "")
                } else {
                    // Se não encontrar, redirecionar ou mostrar erro
                    router.push("/agente")
                }
            } catch (err) {
                console.error("Erro ao carregar denúncia:", err)
            }
        }

        if (denunciaId) {
            loadDenuncia()
        }
    }, [denunciaId, getAll, router])

    const statusOptions: { value: ReportStatus; label: string; color: string }[] = [
        { value: "pendente", label: "Pendente", color: "bg-yellow-500" },
        { value: "em-analise", label: "Em Análise", color: "bg-blue-500" },
        { value: "verificado", label: "Verificado", color: "bg-purple-500" },
        { value: "resolvido", label: "Resolvido", color: "bg-green-500" },
        { value: "falso-positivo", label: "Falso Positivo", color: "bg-red-500" },
    ]

    const riskColors = {
        "muito-baixo": "bg-green-100 text-green-800",
        baixo: "bg-green-200 text-green-900",
        medio: "bg-yellow-200 text-yellow-900",
        alto: "bg-orange-200 text-orange-900",
        "muito-alto": "bg-red-200 text-red-900",
        critico: "bg-red-500 text-white",
    }

    const typeLabels = {
        violencia: "Violência Urbana",
        drogas: "Tráfico de Drogas",
        vandalismo: "Vandalismo",
        iluminacao: "Iluminação Deficiente",
        abandono: "Local Abandonado",
        transito: "Problemas de Trânsito",
        outros: "Outros",
    }

    const handleSaveChanges = async () => {
        if (!denuncia) return

        setIsUpdating(true)
        try {
            // Usar o hook para atualizar o status
            await updateStatus(denuncia._id, newStatus, actionNotes)

            // Atualizar estado local
            setDenuncia({
                ...denuncia,
                status: newStatus,
                assignedAgent: assignedAgent
                    ? {
                        id: "current_agent",
                        name: assignedAgent,
                        badge: "PM-12345",
                    }
                    : denuncia.assignedAgent,
                updatedAt: new Date(),
            })

            setIsEditing(false)
            setActionNotes("")

            // Mostrar feedback de sucesso
            alert("Denúncia atualizada com sucesso!")
        } catch (err) {
            console.error("Erro ao atualizar denúncia:", err)
            alert("Erro ao atualizar denúncia. Tente novamente.")
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDispatchUnit = () => {
        if (!denuncia) return
        // Implementar lógica de despacho
        alert(`Unidade despachada para ${denuncia.location.address}!`)
    }

    const handleContactReporter = () => {
        if (!denuncia) return
        // Implementar lógica de contato
        if (denuncia.reporterInfo?.contactPhone) {
            window.open(`tel:${denuncia.reporterInfo.contactPhone}`)
        } else {
            alert("Informações de contato não disponíveis")
        }
    }

    const handleViewOnMap = () => {
        if (!denuncia) return
        // Abrir no Google Maps
        const { latitude, longitude } = denuncia
        window.open(`https://maps.google.com/?q=${latitude},${longitude}`, "_blank")
    }

    // Loading state
    if (loading || !denuncia) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando detalhes da denúncia...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-red-800">Erro ao Carregar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        <Button onClick={() => router.back()} className="w-full">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button className="bg-transparent text-blue-600 cursor-pointer" variant="ghost" size="sm" onClick={() => router.back()}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Detalhes da Denúncia</h1>
                                <p className="text-sm text-gray-600">
                                    Protocolo: {denuncia._id || `#${denuncia._id.slice(-8).toUpperCase()}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge className={riskColors[denuncia.risco || "medio"]}>
                                {(denuncia.risco || "medio").replace("-", " ").toUpperCase()}
                            </Badge>
                            <Badge
                                variant="outline"
                                className={statusOptions.find((s) => s.value === denuncia.status)?.color + " text-white"}
                            >
                                {statusOptions.find((s) => s.value === denuncia.status)?.label || "Pendente"}
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Informações Básicas */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center space-x-2">
                                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                                        <span>Informações da Ocorrência</span>
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                                        <Edit3 className="h-4 w-4 mr-2" />
                                        {isEditing ? "Cancelar" : "Editar"}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Tipo de Ocorrência</Label>
                                        <p className="text-lg font-semibold">
                                            {typeLabels[denuncia.tipo as keyof typeof typeLabels] || denuncia.tipo}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-600">Data/Hora</Label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span>{new Date(denuncia.createdAt).toLocaleDateString("pt-BR")}</span>
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span>{new Date(denuncia.createdAt).toLocaleTimeString("pt-BR")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                                    <p className="mt-1 text-gray-900 leading-relaxed">{denuncia.descricao}</p>
                                </div>

                                {/*<div>*/}
                                {/*    <Label className="text-sm font-medium text-gray-600">Localização</Label>*/}
                                {/*    <div className="mt-1 space-y-2">*/}
                                {/*        <div className="flex items-center space-x-2">*/}
                                {/*            <MapPin className="h-4 w-4 text-gray-500" />*/}
                                {/*            <span>{denuncia.location.address}</span>*/}
                                {/*        </div>*/}
                                {/*        {denuncia.location.neighborhood && (*/}
                                {/*            <p className="text-sm text-gray-600">Bairro: {denuncia.location.neighborhood}</p>*/}
                                {/*        )}*/}
                                {/*        {denuncia.location.landmark && (*/}
                                {/*            <p className="text-sm text-blue-600">📍 {denuncia.location.landmark}</p>*/}
                                {/*        )}*/}
                                {/*        <div className="text-xs text-gray-500">*/}
                                {/*            Coordenadas: {denuncia.location.coordinates.latitude.toFixed(6)},{" "}*/}
                                {/*            {denuncia.location.coordinates.longitude.toFixed(6)}*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*</div>*/}
                            </CardContent>
                        </Card>

                        {/* Imagens */}
                        {/*{denuncia.images && denuncia.images.length > 0 && (*/}
                        {/*    <Card>*/}
                        {/*        <CardHeader>*/}
                        {/*            <CardTitle className="flex items-center space-x-2">*/}
                        {/*                <Camera className="h-5 w-5" />*/}
                        {/*                <span>Evidências Visuais</span>*/}
                        {/*            </CardTitle>*/}
                        {/*        </CardHeader>*/}
                        {/*        <CardContent>*/}
                        {/*            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
                        {/*                {denuncia.images.map((image, index) => (*/}
                        {/*                    <div key={index} className="space-y-2">*/}
                        {/*                        <img*/}
                        {/*                            src={image.url || "/placeholder.svg?height=300&width=400"}*/}
                        {/*                            alt={`Evidência ${index + 1}`}*/}
                        {/*                            className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"*/}
                        {/*                            onClick={() => setSelectedImage(index)}*/}
                        {/*                        />*/}
                        {/*                        <div className="text-xs text-gray-500">*/}
                        {/*                            <p>Imagem {index + 1}</p>*/}
                        {/*                            {image.metadata && (*/}
                        {/*                                <p>Capturada em: {new Date(image.metadata.capturedAt).toLocaleString("pt-BR")}</p>*/}
                        {/*                            )}*/}
                        {/*                        </div>*/}
                        {/*                    </div>*/}
                        {/*                ))}*/}
                        {/*            </div>*/}
                        {/*        </CardContent>*/}
                        {/*    </Card>*/}
                        {/*)}*/}

                        {/* Análise da IA (se disponível) */}
                        {/*{denuncia.aiAnalysis && (*/}
                        {/*    <Card>*/}
                        {/*        <CardHeader>*/}
                        {/*            <CardTitle className="flex items-center space-x-2">*/}
                        {/*                <Brain className="h-5 w-5 text-purple-600" />*/}
                        {/*                <span>Análise Preditiva</span>*/}
                        {/*            </CardTitle>*/}
                        {/*        </CardHeader>*/}
                        {/*        <CardContent className="space-y-4">*/}
                        {/*            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">*/}
                        {/*                <div className="text-center p-4 bg-blue-50 rounded-lg">*/}
                        {/*                    <div className="text-2xl font-bold text-blue-600">{denuncia.aiAnalysis.riskScore || 0}</div>*/}
                        {/*                    <div className="text-sm text-blue-800">Score de Risco</div>*/}
                        {/*                </div>*/}
                        {/*                <div className="text-center p-4 bg-green-50 rounded-lg">*/}
                        {/*                    <div className="text-2xl font-bold text-green-600">*/}
                        {/*                        {((denuncia.aiAnalysis.confidence || 0) * 100).toFixed(0)}%*/}
                        {/*                    </div>*/}
                        {/*                    <div className="text-sm text-green-800">Confiança</div>*/}
                        {/*                </div>*/}
                        {/*                <div className="text-center p-4 bg-purple-50 rounded-lg">*/}
                        {/*                    <div className="text-2xl font-bold text-purple-600">*/}
                        {/*                        {denuncia.aiAnalysis.processingTime || 0}ms*/}
                        {/*                    </div>*/}
                        {/*                    <div className="text-sm text-purple-800">Tempo Análise</div>*/}
                        {/*                </div>*/}
                        {/*            </div>*/}

                        {/*            {denuncia.aiAnalysis.recommendations && denuncia.aiAnalysis.recommendations.length > 0 && (*/}
                        {/*                <div>*/}
                        {/*                    <h4 className="font-semibold mb-2">Recomendações da IA</h4>*/}
                        {/*                    <div className="space-y-2">*/}
                        {/*                        {denuncia.aiAnalysis.recommendations.map((rec, index) => (*/}
                        {/*                            <Alert key={index}>*/}
                        {/*                                <Brain className="h-4 w-4" />*/}
                        {/*                                <AlertDescription>*/}
                        {/*                                    <strong>{rec.action || rec}</strong>*/}
                        {/*                                    {typeof rec === "object" && rec.description && (*/}
                        {/*                                        <>*/}
                        {/*                                            <br />*/}
                        {/*                                            <span className="text-sm">{rec.description}</span>*/}
                        {/*                                        </>*/}
                        {/*                                    )}*/}
                        {/*                                </AlertDescription>*/}
                        {/*                            </Alert>*/}
                        {/*                        ))}*/}
                        {/*                    </div>*/}
                        {/*                </div>*/}
                        {/*            )}*/}
                        {/*        </CardContent>*/}
                        {/*    </Card>*/}
                        {/*)}*/}
                    </div>

                    {/* Coluna Lateral */}
                    <div className="space-y-6">
                        {/* Ações Rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Shield className="h-5 w-5" />
                                    <span>Ações</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button className="w-full text-white bg-red-600 hover:bg-red-700" onClick={handleDispatchUnit}>
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Despachar Unidade
                                </Button>
                                <Button variant="outline" className="w-full bg-blue-600 text-white" onClick={handleContactReporter}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contatar Denunciante
                                </Button>
                                <Button variant="outline" className="w-full bg-blue-600 text-white" onClick={handleViewOnMap}>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Ver no Mapa
                                </Button>
                                <Button variant="outline" className="w-full bg-blue-600 text-white">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Gerar Relatório
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Atualizar Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Atualizar Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Novo Status</Label>
                                    <Select value={newStatus} onValueChange={(value: ReportStatus) => setNewStatus(value)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                                                        <span>{option.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="agent">Agente Responsável</Label>
                                    <Input
                                        id="agent"
                                        value={assignedAgent}
                                        onChange={(e) => setAssignedAgent(e.target.value)}
                                        placeholder="Nome do agente"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="notes">Observações</Label>
                                    <Textarea
                                        className="bg-transparent"
                                        id="notes"
                                        value={actionNotes}
                                        onChange={(e) => setActionNotes(e.target.value)}
                                        placeholder="Adicione observações sobre a ação tomada..."
                                        rows={3}
                                    />
                                </div>

                                <Button className="w-full bg-blue-600 text-white" onClick={handleSaveChanges} disabled={isUpdating}>
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Informações do Denunciante */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5" />
                                    <span>Denunciante</span>
                                </CardTitle>
                            </CardHeader>
                            {/*<CardContent>*/}
                            {/*    <div className="space-y-2">*/}
                            {/*        <div className="flex items-center space-x-2">*/}
                            {/*            <Badge variant={denuncia.reporterInfo?.isAnonymous ? "secondary" : "default"}>*/}
                            {/*                {denuncia.reporterInfo?.isAnonymous ? "Anônimo" : "Identificado"}*/}
                            {/*            </Badge>*/}
                            {/*        </div>*/}
                            {/*        {denuncia.reporterInfo?.contactInfo && (*/}
                            {/*            <p className="text-sm text-gray-600">{denuncia.reporterInfo.contactInfo}</p>*/}
                            {/*        )}*/}
                            {/*        {!denuncia.reporterInfo?.isAnonymous && denuncia.reporterInfo?.contactPhone && (*/}
                            {/*            <div className="flex space-x-2 mt-3">*/}
                            {/*                <Button variant="outline" size="sm" onClick={handleContactReporter}>*/}
                            {/*                    <Phone className="h-4 w-4 mr-1" />*/}
                            {/*                    Ligar*/}
                            {/*                </Button>*/}
                            {/*                {denuncia.reporterInfo.contactEmail && (*/}
                            {/*                    <Button variant="outline" size="sm">*/}
                            {/*                        <Mail className="h-4 w-4 mr-1" />*/}
                            {/*                        Email*/}
                            {/*                    </Button>*/}
                            {/*                )}*/}
                            {/*            </div>*/}
                            {/*        )}*/}
                            {/*    </div>*/}
                            {/*</CardContent>*/}
                        </Card>

                        {/* Informações Técnicas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informações Técnicas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">ID:</span>
                                    <span className="font-mono">{denuncia._id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Criado:</span>
                                    <span>{new Date(denuncia.createdAt).toLocaleString("pt-BR")}</span>
                                </div>
                                {denuncia.updatedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Atualizado:</span>
                                        <span>{new Date(denuncia.updatedAt).toLocaleString("pt-BR")}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Fonte:</span>
                                    <span>{denuncia.source || "Web"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
