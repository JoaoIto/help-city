interface IPredictiveData {
    rowCount: number;
    analysis: {
        temporal: string;
        area: string;
        efetividade: string;
        recomendacao: string;
    };
    metrics: {
        precision: number;
        recall: number;
        f1Score: number;
        latency: number;
    };
}
