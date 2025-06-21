import {RiskType} from "@/models/IRisk";

interface ILocation {
    latitude: string;
    longitude: string;
    addressReference: string;
}

export interface EvaluateDenunciaResponse {
    type: RiskType;
    severity: Severity;
    confidenceScore: number;
}

export interface EvaluateDenunciaRequest {
    tipo: string;
    description: string;
    // se for upload via multipart/form-data, use FormData no cliente
    imageBase64: string;
    location: ILocation
}

export type Severity = "todos" | "baixo" | "medio" | "alto" | "critico";

export type StatusDenuncia = "pendente" | "em-analise" | "verificado" | "resolvido";

export interface IDenuncia {
    _id: string;
    tipo: "violencia" | "drogas" | "vandalismo" | "iluminacao" | "abandono" | "outros";
    descricao: string;
    endereco?: string;
    latitude: string;
    longitude: string;
    imageBase64?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    source: string;
    assignedAgent?: IAssignedAgent;
    reporterInfo?: IReporter;
    // campos gerenciados pela API
    status: StatusDenuncia;
    risco?: Severity;
    actions: IActionsDenuncia[];
}

export interface IActionsDenuncia {
    id: string;
    notes: string;
    timestamp: Date | string;
    performedBy: IPerformedBy;
    description: string;
}
export interface IReporter {
    name?: string;
    contactPhone?: string;
    email?: string;
    isAnonymous?: boolean;
    contactInfo?: string;
}

export interface IPerformedBy {
    name: string;
    role: string;
}

export interface IAssignedAgent {
    id: string;
    name: string;
    badge: string;
}