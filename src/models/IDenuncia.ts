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

export type Severity = "baixo" | "medio" | "alto" | "crítico";

export type StatusDenuncia = "pendente" | "em-analise" | "resolvido";

export interface IDenuncia {
    _id: string;
    tipo: "violencia" | "drogas" | "vandalismo" | "iluminacao" | "abandono" | "outros";
    descricao: string;
    endereco?: string;
    latitude: string;
    longitude: string;
    imageBase64?: string;
    createdAt: string;
    // campos gerenciados pela API
    status: StatusDenuncia;
    risco?: Severity;
}