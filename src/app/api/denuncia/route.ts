import {NextResponse} from "next/server";
import clientPromise from "@/lib/mongodb";
import {DenunciaSchema} from "@/schemas/DenunciaSchema";

export async function POST(request: Request) {
    // 1) lê o corpo
    const body = await request.json();

    // 2) valida com Zod (usa o schema, não a interface)
    const parseResult = DenunciaSchema.safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json(
            { errors: parseResult.error.format() },
            { status: 422 }
        );
    }
    const denuncia = parseResult.data; // DenunciaInput

    try {
        // 3) conecta ao MongoDB
        const client = await clientPromise;
        const db = client.db("help-city");

        // 4) insere na coleção 'denuncias'
        const now = new Date();
        const insertResult = await db.collection("denuncias").insertOne({
            ...denuncia,
            status: 'pendente',
            createdAt: now,
        });

        // 5) retorna sucesso com o id
        return NextResponse.json(
            { success: true, denuncia: insertResult },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erro ao inserir denúncia:", error);
        return NextResponse.json(
            { error: "Erro interno ao salvar a denúncia." },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const client = await clientPromise;
    const db = client.db('help-city');

    const ALLOWED = ["tipo", "descricao", "endereco", "latitude", "longitude"];
    // 1) Tenta ler filtros do body (JSON) — só funciona se o cliente enviar
    let params: Record<string, string> = {};
    try {
        params = await request.json();
    } catch {
        // se não vier body válido, fallback para query string
       console.log("aqui veio sem params")
    }

    // 2) Monta filtro apenas com campos permitidos
    const filter: Record<string, any> = {};
    for (const [key, val] of Object.entries(params)) {
        if (!ALLOWED.includes(key)) continue;
        // substring match só para texto
        filter[key] =
            key === "descricao" || key === "endereco"
                ? { $regex: val, $options: "i" }
                : val;
    }

    try {
        const docs = await db
            .collection('denuncias')
            .find(filter)
            .sort({ createdAt: -1 })
            .toArray();
        return NextResponse.json(docs, { status: 200 });
    } catch (e) {
        console.error("Erro ao buscar denúncias:", e);
        return NextResponse.json(
            { error: "Erro ao buscar denúncias." },
            { status: 500 }
        );
    }
}
