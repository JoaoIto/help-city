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
    FileText,
    Navigation,
    Loader2,
} from "lucide-react"
import { useDenuncias } from "@/hooks/useDenuncias"
import {IDenuncia, Severity} from "@/models/IDenuncia";

type ReportStatus = "pendente" | "em-analise" | "verificado" | "resolvido"

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
    ]

    const riskColors: Record<Severity, string> = {
        todos: "bg-gray-200 text-gray-900",
        baixo: "bg-green-200 text-green-900",
        medio: "bg-yellow-200 text-yellow-900",
        alto: "bg-orange-200 text-orange-900",
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
        alert(`Unidade despachada!`)
    }

    const handleContactReporter = () => {
        if (!denuncia) return
        if (denuncia.reporterInfo?.contactPhone) {
            window.open(`tel:${denuncia.reporterInfo.contactPhone}`)
        } else {
            alert("Informações de contato não disponíveis")
        }
    }

    const handleViewOnMap = () => {
        if (!denuncia) return
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
                        <Button onClick={() => router.back()} className="text-blue-600 w-full">
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
                            <Button className="text-blue-600 cursor-pointer" variant="ghost" size="sm" onClick={() => router.back()}>
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
                                    <Button className="cursor-pointer" variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
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

                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Localização <MapPin className="h-4 w-4 text-gray-500" /></Label>
                                    <div className="mt-1 space-y-2">
                                        <div className="flex items-center space-x-2">
                                            Coordenadas: {denuncia.latitude}
                                            {denuncia.longitude}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Histórico de Ações */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Histórico de Ações</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {denuncia.actions && denuncia.actions.length > 0 ? (
                                        denuncia.actions
                                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                            .map((action, index) => (
                                                <div key={action.id || index} className="border-l-2 border-blue-200 pl-3 pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-900">{action.description}</span>
                                                        <span className="text-xs text-gray-500">
                              {new Date(action.timestamp).toLocaleString("pt-BR")}
                            </span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        Por: {action.performedBy?.name || "Sistema"} ({action.performedBy?.role || "sistema"})
                                                    </div>
                                                    {action.notes && <div className="text-xs text-gray-500 mt-1 italic">{action.notes}</div>}
                                                </div>
                                            ))
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center py-4">Nenhuma ação registrada ainda</div>
                                    )}

                                    {/* Ação de criação sempre presente */}
                                    <div className="border-l-2 border-green-200 pl-3 pb-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">Denúncia criada</span>
                                            <span className="text-xs text-gray-500">
                        {new Date(denuncia.createdAt).toLocaleString("pt-BR")}
                      </span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">Por: Cidadão (denunciante)</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        {/* Imagens */}
                        {/* Imagens de evidência */}
                        {denuncia.imageBase64 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Camera className="h-5 w-5" />
                                        <span>Evidência Visual</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <img
                                            src={denuncia.imageBase64}
                                            alt="Evidência da denúncia"
                                            className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                <Button className="cursor-pointer w-full text-white bg-red-600 hover:bg-red-700" onClick={handleDispatchUnit}>
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Despachar Unidade
                                </Button>
                                <Button variant="outline" className="cursor-pointer w-full bg-transparent border-2 border-solid border-blue-600 hover:bg-blue-600 hover:text-white" onClick={handleContactReporter}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Contatar Denunciante
                                </Button>
                                <Button variant="outline" className="cursor-pointer w-full bg-transparent border-2 border-solid border-blue-600 hover:bg-blue-600 hover:text-white" onClick={handleViewOnMap}>
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Ver no Mapa
                                </Button>
                                <Button variant="outline" className="cursor-pointer w-full bg-transparent border-2 border-solid border-blue-600 hover:bg-blue-600 hover:text-white">
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

                                <Button className="w-full cursor-pointer border-2 border-solid border-blue-600 text-white bg-blue-600 hover:bg-blue-800 " onClick={handleSaveChanges} disabled={isUpdating}>
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
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={denuncia.reporterInfo?.isAnonymous ? "secondary" : "default"}>
                                            {denuncia.reporterInfo?.isAnonymous ? "Anônimo" : "Identificado"}
                                        </Badge>
                                    </div>
                                    {denuncia.reporterInfo?.contactInfo && (
                                        <p className="text-sm text-gray-600">{denuncia.reporterInfo.contactInfo}</p>
                                    )}
                                    {!denuncia.reporterInfo?.isAnonymous && denuncia.reporterInfo?.contactPhone && (
                                        <div className="flex space-x-2 mt-3">
                                            <Button variant="outline" size="sm" onClick={handleContactReporter}>
                                                <Phone className="h-4 w-4 mr-1" />
                                                Ligar
                                            </Button>
                                            {denuncia.reporterInfo.email && (
                                                <Button variant="outline" size="sm">
                                                    <Mail className="h-4 w-4 mr-1" />
                                                    Email
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
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
