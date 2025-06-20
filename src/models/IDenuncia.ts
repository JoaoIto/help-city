import {RiskType, Severity} from "@/models/IRisk";

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
