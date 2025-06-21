import { NextResponse } from "next/server"
import { z } from "zod"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"

// Schema para validar o body do PATCH
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

interface UpdateFields {
    status: string
    updatedAt: Date
    assignedAgent?: { id: string; name: string; badge: string }
    actions?: unknown[]
}

type UpdateDoc = {
    $set: UpdateFields
    $push?: { actions: unknown }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1) Await params (Next.js 15+)
        const { id } = await params

        // 2) Validar se o ID é um ObjectId válido
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "ID da denúncia inválido" }, { status: 400 })
        }

        // 3) Ler e validar body
        const body = await request.json()
        const parsed = UpdateStatusSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ errors: parsed.error.format() }, { status: 422 })
        }

        const { status, notes, assignedAgent } = parsed.data

        // 4) Conectar ao MongoDB
        const client = await clientPromise
        const db = client.db("help-city")

        // 5) Buscar denúncia existente
        const existing = await db.collection("denuncias").findOne({
            _id: new ObjectId(id),
        })

        if (!existing) {
            return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 })
        }

        // 6) Preparar campos de atualização
        const now = new Date()
        const updateFields: UpdateFields = { status, updatedAt: now }
        if (assignedAgent) {
            updateFields.assignedAgent = assignedAgent
        }

        // 7) Criar item de histórico (action)
        const newAction = {
            id: new ObjectId().toString(),
            type: "updated",
            description: `Status alterado para ${status}${notes ? `. Observações: ${notes}` : ""}`,
            performedBy: {
                id: assignedAgent?.id || "system",
                name: assignedAgent?.name || "Sistema",
                role: "agente",
            },
            timestamp: now,
            notes,
        }

        // 8) Montar documento de update para o MongoDB
        const updateDoc: UpdateDoc = { $set: updateFields }
        if (existing.actions && Array.isArray(existing.actions)) {
            updateDoc.$push = { actions: newAction }
        } else {
            // primeiro push, então definimos actions no $set
            updateFields.actions = [newAction]
        }

        // 9) Executar updateOne
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        await db.collection("denuncias").updateOne({ _id: new ObjectId(id) }, updateDoc)

        // 10) Buscar e retornar o documento atualizado
        const updated = await db.collection("denuncias").findOne({ _id: new ObjectId(id) })

        return NextResponse.json({ success: true, denuncia: updated }, { status: 200 })
    } catch (err) {
        console.error("Erro no PATCH:", err)
        return NextResponse.json({ error: "Erro interno ao atualizar denúncia." }, { status: 500 })
    }
}

// Método GET para buscar denúncia específica
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1) Await params (Next.js 15+)
        const { id } = await params

        // 2) Validar se o ID é um ObjectId válido
        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "ID da denúncia inválido" }, { status: 400 })
        }

        // 3) Conectar ao MongoDB
        const client = await clientPromise
        const db = client.db("help-city")

        // 4) Buscar a denúncia
        const denuncia = await db.collection("denuncias").findOne({
            _id: new ObjectId(id),
        })

        if (!denuncia) {
            return NextResponse.json({ error: "Denúncia não encontrada" }, { status: 404 })
        }

        return NextResponse.json({ success: true, denuncia }, { status: 200 })
    } catch (error) {
        console.error("Erro ao buscar denúncia:", error)
        return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
    }
}
