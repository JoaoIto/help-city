// src/hooks/useDenuncias.ts
import { IDenuncia } from "@/models/IDenuncia";
import { useState, useCallback } from "react";

// payload para criação
export interface DenunciaInput {
    tipo: IDenuncia["tipo"];
    descricao: string;
    endereco?: string;
    latitude: string;
    longitude: string;
    imageBase64?: string;
}

export function useDenuncias(baseUrl = "/api/denuncia") {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAll = useCallback(async (): Promise<IDenuncia[]> => {
        setLoading(true);
        try {
            const res = await fetch(baseUrl);
            if (!res.ok) throw new Error(await res.text());
            return (await res.json()) as IDenuncia[];
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    const getByFilter = useCallback(
        async (filter: Partial<Omit<IDenuncia, "_id" | "createdAt" | "risco" | "status">>): Promise<IDenuncia[]> => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                Object.entries(filter).forEach(([k, v]) => {
                    if (v !== undefined) params.append(k, String(v));
                });
                const res = await fetch(`${baseUrl}?${params.toString()}`);
                if (!res.ok) throw new Error(await res.text());
                return (await res.json()) as IDenuncia[];
            } finally {
                setLoading(false);
            }
        },
        [baseUrl]
    );

    const create = useCallback(async (data: DenunciaInput): Promise<IDenuncia> => {
        setLoading(true);
        try {
            const res = await fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, status: "pendente" }),
            });
            if (!res.ok) throw new Error(await res.text());
            return (await res.json()) as IDenuncia;
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    const updateStatus = async (id: string, status: string, notes?: string): Promise<void> => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`/api/denuncia/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, status, notes }),
            })

            if (!response.ok) throw new Error("Erro ao atualizar status")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro desconhecido")
            throw err
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        create,
        error,
        getAll,
        getByFilter,
        updateStatus,
    }
}
