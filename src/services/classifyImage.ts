import {RiskType} from "@/models/IRisk";

interface IImageClassification {
    label: string;
    score: number;
}
export async function classifyImage(base64: string): Promise<IImageClassification[]> {
    const res = await fetch(
        "https://api-inference.huggingface.co/pipeline/zero-shot-image-classification/openai/clip-vit-base-patch32",
        {
            headers: {
                Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: base64,
                parameters: { candidate_labels: RiskType },
            }),
        }
    );
    const { labels, scores } = await res.json() as {
        labels: string[];
        scores: number[];
    };

    // monta um array de pares { label, score }
    return labels.map((label, i) => ({ label, score: scores[i] }));
}

export function decideTypeByImage(results: IImageClassification[]): RiskType {
    // filtra apenas labels com confiança acima de um limiar
    const hits = results.filter(r => r.score > 0.3);
    if (hits.length === 0) {
        return RiskType.Outros;
    }
    // pega o resultado com maior score
    const top = hits.reduce((best, curr) => curr.score > best.score ? curr : best);
    // mapeia a string de label para o enum RiskType
    // assumindo que os labels enviados batem exatamente com os valores do enum
    return (Object.values(RiskType) as string[]).includes(top.label)
        ? (top.label as RiskType)
        : RiskType.Outros;
}
