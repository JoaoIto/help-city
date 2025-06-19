import { RiskType } from "@/models/IRisk";

/**
 * Analisa o texto e retorna um RiskType baseado em palavras-chave.
 * Use enquanto não tiver classificação de imagem integrada.
 */
export function identifyType(text: string): RiskType {
    const lower = text.toLowerCase();

    if (lower.includes("luz") || lower.includes("iluminação")) {
        return RiskType.Iluminacao;        // “Iluminação Pública”
    }
    if (lower.includes("assalto") || lower.includes("roubo")) {
        return RiskType.Assalto;           // “Assalto”
    }
    if (lower.includes("pichação") || lower.includes("vandalismo")) {
        return RiskType.Vandalismo;        // “Vandalismo”
    }
    if (lower.includes("droga") || lower.includes("entorpecente")) {
        return RiskType.Drogas;            // “Uso de Drogas”
    }
    if (lower.includes("abandono") || lower.includes("sujeira")) {
        return RiskType.AreaDegradada;     // “Área Degradada”
    }

    // Se não encontrar nenhuma palavra-chave
    return RiskType.Outros;
}
