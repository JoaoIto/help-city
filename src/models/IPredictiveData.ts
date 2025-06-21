interface Analysis {
    temporal: string
    area: string
    efetividade: string
    recomendacao: string
}

interface Metrics {
    precision: number
    recall: number
    f1Score: number
    latency: number
}

export interface IPredictiveData {
    rowCount: number
    analysis: Analysis
    metrics: Metrics
    // Exemplo de distribuição de risco
    riskDistribution: { level: string; count: number }[]
    regionDistribution: {
        name: string;
        count: number;
    }[];
    hourlyDistribution: {
        hour: number;
        count: number;
    }[];
}