import { NextResponse } from "next/server";
import { z } from "zod";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

// Schema para validar o body do PATCH
const UpdateStatusSchema = z.object({
    id: z.string(),
    status: z.enum([
        "pendente",
        "em-analise",
        "verificado",
        "resolvido",
        "falso-positivo",
    ]),
    notes: z.string().optional(),
    assignedAgent: z
        .object({
            id: z.string(),
            name: z.string(),
            badge: z.string(),
        })
        .optional(),
});

interface UpdateFields {
    status: string;
    updatedAt: Date;
    assignedAgent?: { id: string; name: string; badge: string };
    actions?: unknown[];
}

type UpdateDoc = {
    $set: UpdateFields;
    $push?: { actions: unknown };
};

export async function PATCH(request: Request) {
    // 1) Ler e validar body
    const body = await request.json();
    const parsed = UpdateStatusSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ errors: parsed.error.format() }, { status: 422 });
    }
    const { id, status, notes, assignedAgent } = parsed.data;

    // 2) Validar ObjectId
    if (!ObjectId.isValid(id)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        // 3) Conectar ao MongoDB
        const client = await clientPromise;
        const db = client.db("help-city");

        // 4) Buscar denúncia existente
        const existing = await db.collection("denuncias").findOne({
            _id: new ObjectId(id),
        });
        if (!existing) {
            return NextResponse.json(
                { error: "Denúncia não encontrada" },
                { status: 404 }
            );
        }

        // 5) Preparar campos de atualização
        const now = new Date();
        const updateFields: UpdateFields = { status, updatedAt: now };
        if (assignedAgent) {
            updateFields.assignedAgent = assignedAgent;
        }

        // 6) Criar item de histórico (action)
        const newAction = {
            id: new ObjectId().toString(),
            type: "updated",
            description: `Status alterado para ${status}${
                notes ? `. Observações: ${notes}` : ""
            }`,
            performedBy: {
                id: assignedAgent?.id || "system",
                name: assignedAgent?.name || "Sistema",
                role: "agente",
            },
            timestamp: now,
            notes,
        };

        // 7) Montar documento de update para o MongoDB
        const updateDoc: UpdateDoc = { $set: updateFields };
        if (existing.actions) {
            updateDoc.$push = { actions: newAction };
        } else {
            // primeiro push, então definimos actions no $set
            updateFields.actions = [newAction];
        }

        // 8) Executar updateOne

        await db.collection("denuncias").updateOne(
            { _id: new ObjectId(id) },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            updateDoc
        );

        // 9) Buscar e retornar o documento atualizado
        const updated = await db
            .collection("denuncias")
            .findOne({ _id: new ObjectId(id) });

        return NextResponse.json({ success: true, denuncia: updated }, { status: 200 });
    } catch (err) {
        console.error("Erro no PATCH:", err);
        return NextResponse.json(
            { error: "Erro interno ao atualizar denúncia." },
            { status: 500 }
        );
    }
}