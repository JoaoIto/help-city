import { NextResponse } from "next/server"
import { z } from "zod"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// Schema para validar os dados de atualização de status
const UpdateStatusSchema = z.object({
    status: z.enum(["pendente", "em-analise", "verificado", "resolvido", "falso-positivo"]),
    notes: z.string().optional(),
    assignedAgent: z
        .object({
            id: z.string(),
            name: z.string(),
            badge: z.string(),
        })
        .optional(),
})

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        // 1) Validar se o ID é um ObjectId válido
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ error: "ID da denúncia inválido" }, { status: 400 })
        }

        // 2) Ler o corpo da requisição
        const body = await request.json()

        // 3) Validar com Zod
        const parseResult = UpdateStatusSchema.safeParse(body)
        if (!parseResult.success) {
            return NextResponse.json({ errors: parseResult.error.format() }, { status: 422 })
        }

        const updateData = parseResult.data

        // 4) Conectar ao MongoDB
        const client = await clientPromise
        const db = client.db("help-city")

        // 5) Verificar se a denúncia existe
        const existingDenuncia = await db.collection("denuncias").findOne({
            _id: new ObjectId(params.id),
        })

        if (!existingDenuncia) {
            return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 })
        }

        // 6) Preparar dados para atualização
        const now = new Date()
        const updateFields: any = {
            status: updateData.status,
            updatedAt: now,
        }

        // Adicionar agente responsável se fornecido
        if (updateData.assignedAgent) {
            updateFields.assignedAgent = updateData.assignedAgent
        }

        // Adicionar histórico de ações
        const newAction = {
            id: new ObjectId().toString(),
            type: "updated",
            description: `Status alterado para ${updateData.status}${updateData.notes ? `. Observações: ${updateData.notes}` : ""}`,
            performedBy: {
                id: updateData.assignedAgent?.id || "system",
                name: updateData.assignedAgent?.name || "Sistema",
                role: "agente",
            },
            timestamp: now,
            notes: updateData.notes,
        }

        // Adicionar a nova ação ao array de actions (ou criar se não existir)
        updateFields.$push = {
            actions: newAction,
        }

        // Se não existe o array actions, criar
        if (!existingDenuncia.actions) {
            updateFields.actions = [newAction]
            delete updateFields.$push
        }

        // 7) Atualizar a denúncia
        const updateResult = await db
            .collection("denuncias")
            .updateOne(
                { _id: new ObjectId(params.id) },
                updateFields.$push ? { $set: updateFields, $push: updateFields.$push } : { $set: updateFields },
            )

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 })
        }

        // 8) Buscar a denúncia atualizada para retornar
        const updatedDenuncia = await db.collection("denuncias").findOne({
            _id: new ObjectId(params.id),
        })

        // 9) Retornar sucesso
        return NextResponse.json(
            {
                success: true,
                message: "Status da denúncia atualizado com sucesso",
                denuncia: updatedDenuncia,
            },
            { status: 200 },
        )
    } catch (error) {
        console.error("Erro ao atualizar status da denúncia:", error)
        return NextResponse.json({ error: "Erro interno ao atualizar a denúncia." }, { status: 500 })
    }
}

// Método GET para buscar uma denúncia específica (opcional)
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        // Validar se o ID é um ObjectId válido
        if (!ObjectId.isValid(params.id)) {
            return NextResponse.json({ error: "ID da denúncia inválido" }, { status: 400 })
        }

        // Conectar ao MongoDB
        const client = await clientPromise
        const db = client.db("help-city")

        // Buscar a denúncia
        const denuncia = await db.collection("denuncias").findOne({
            _id: new ObjectId(params.id),
        })

        if (!denuncia) {
            return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 })
        }

        return NextResponse.json(
            {
                success: true,
                denuncia,
            },
            { status: 200 },
        )
    } catch (error) {
        console.error("Erro ao buscar denúncia:", error)
        return NextResponse.json({ error: "Erro interno ao buscar a denúncia." }, { status: 500 })
    }
}
