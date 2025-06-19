"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Badge } from "@/app/components/ui/badge"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { ArrowLeft, Camera, MapPin, Upload, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function CidadaoPage() {
    const [formData, setFormData] = useState({
        tipo: "",
        descricao: "",
        endereco: "",
        latitude: "",
        longitude: "",
        imagem: null as File | null,
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

    const tiposOcorrencia = [
        { value: "violencia", label: "Violência Urbana", color: "bg-red-500" },
        { value: "drogas", label: "Tráfico de Drogas", color: "bg-orange-500" },
        { value: "vandalismo", label: "Vandalismo", color: "bg-yellow-500" },
        { value: "iluminacao", label: "Iluminação Deficiente", color: "bg-blue-500" },
        { value: "abandono", label: "Local Abandonado", color: "bg-gray-500" },
        { value: "outros", label: "Outros", color: "bg-purple-500" },
    ]

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setCurrentLocation({ lat: latitude, lng: longitude })
                    setFormData((prev) => ({
                        ...prev,
                        latitude: latitude.toString(),
                        longitude: longitude.toString(),
                    }))
                },
                (error) => {
                    console.error("Erro ao obter localização:", error)
                },
            )
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData((prev) => ({ ...prev, imagem: file }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simular envio
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setSubmitted(true)
        setIsSubmitting(false)
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <CardTitle className="text-2xl text-green-800">Denúncia Enviada!</CardTitle>
                        <CardDescription>Sua denúncia foi recebida e será analisada pela nossa IA preditiva</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-green-800">
                                <strong>Protocolo:</strong> #BR2024{Math.floor(Math.random() * 10000)}
                            </p>
                            <p className="text-sm text-green-800 mt-1">
                                <strong>Status:</strong> Em análise pela IA
                            </p>
                        </div>
                        <Link href="/">
                            <Button className="w-full">Voltar ao Início</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center space-x-4">
                        <Link href="/">
                            <Button className="text-blue-600 cursor-pointer" variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Voltar
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Nova Denúncia</h1>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-6 w-6 text-orange-600" />
                            <span>Reportar Situação de Risco</span>
                        </CardTitle>
                        <CardDescription>
                            Ajude a tornar nossa cidade mais segura reportando situações que oferecem risco à segurança pública
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tipo de Ocorrência */}
                            <div className="space-y-2">
                                <Label htmlFor="tipo">Tipo de Ocorrência *</Label>
                                <Select
                                    value={formData.tipo}
                                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipo: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo de situação" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposOcorrencia.map((tipo) => (
                                            <SelectItem key={tipo.value} value={tipo.value}>
                                                <div className="flex items-center space-x-2">
                                                    <div className={`w-3 h-3 rounded-full ${tipo.color}`}></div>
                                                    <span>{tipo.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Descrição */}
                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição da Situação *</Label>
                                <Textarea
                                    className="bg-transparent"
                                    id="descricao"
                                    placeholder="Descreva detalhadamente a situação observada..."
                                    value={formData.descricao}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                                    rows={4}
                                />
                            </div>

                            {/* Upload de Imagem */}
                            <div className="space-y-2">
                                <Label htmlFor="imagem">Foto do Local *</Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <input type="file" id="imagem" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    <label htmlFor="imagem" className="cursor-pointer">
                                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                            {formData.imagem ? formData.imagem.name : "Clique para adicionar uma foto"}
                                        </p>
                                    </label>
                                </div>
                            </div>

                            {/* Localização */}
                            <div className="space-y-4">
                                <Label>Localização *</Label>

                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={getCurrentLocation}
                                        className="flex bg-blue-600 text-white items-center space-x-2 cursor-pointer"
                                    >
                                        <MapPin className="h-4 w-4" />
                                        <span>Usar Localização Atual</span>
                                    </Button>
                                    {currentLocation && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                            Localização obtida
                                        </Badge>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="latitude">Latitude</Label>
                                        <Input
                                            id="latitude"
                                            placeholder="-15.7942"
                                            value={formData.latitude}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, latitude: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="longitude">Longitude</Label>
                                        <Input
                                            id="longitude"
                                            placeholder="-47.8822"
                                            value={formData.longitude}
                                            onChange={(e) => setFormData((prev) => ({ ...prev, longitude: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="endereco">Endereço de Referência</Label>
                                    <Input
                                        id="endereco"
                                        placeholder="Ex: Próximo ao Conjunto Nacional, Asa Norte"
                                        value={formData.endereco}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, endereco: e.target.value }))}
                                    />
                                </div>
                            </div>

                            {/* Alert de Privacidade */}
                            <Alert>
                                <AlertDescription>
                                    Suas informações são tratadas com total confidencialidade. A localização será usada apenas para fins
                                    de segurança pública.
                                </AlertDescription>
                            </Alert>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                disabled={
                                    isSubmitting || !formData.tipo || !formData.descricao || !formData.latitude || !formData.longitude
                                }
                            >
                                {isSubmitting ? (
                                    <>
                                        <Upload className="h-4 w-4 mr-2 animate-spin" />
                                        Enviando Denúncia...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Enviar Denúncia
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
