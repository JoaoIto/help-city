
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { parseISO, isAfter, isBefore } from "date-fns";
// const OPENAI_TOKEN = process.env.OPENAI_API_KEY!

// export async function GET(request: Request) {
//     const { searchParams } = new URL(request.url)
//     const start = searchParams.get("startDate")
//     const end   = searchParams.get("endDate")
//     const clientOpenAI = new OpenAI();
//
//     if (!start || !end) {
//         return NextResponse.json({ error: "Faltam startDate ou endDate como ISO strings" }, { status: 400 })
//     }
//
//     const startDt = new Date(start)
//     const endDt   = new Date(end)
//     if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
//         return NextResponse.json({ error: "Datas inválidas" }, { status: 400 })
//     }
//
//     // 1) Buscar no MongoDB
//     const client = await clientPromise
//     const db = client.db("help-city")
//     const rows = await db
//         .collection("denuncias")
//         .find({
//             createdAt: { $gte: startDt, $lte: endDt }
//         })
//         .toArray()
//
//     const rowCount = rows.length
//     if (!rowCount) {
//         return NextResponse.json({ rowCount: 0, analysis: "Não há registros nesse período." })
//     }
//
//     // 2) Prompt para a OpenAI
//     const columns = Object.keys(rows[0]).filter(k => k !== "_id").join(", ")
//     const prompt = `
// Você é um analista de dados para segurança pública.
// Recebi ${rowCount} denúncias criadas entre ${start} e ${end}, com colunas: ${columns}.
// Resuma:
// 1) Total de registros.
// 2) Média de ocorrências por tipo de risco.
// 3) Previsão da região com mais denúncias nas próximas 24h.
// `
//
//     // 3) Chamada ao ChatGPT
//     const res = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//             "Authorization": `Bearer ${OPENAI_TOKEN}`,
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//             model: "gpt-4o-mini",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.5,
//         }),
//     })
//
//     const response = await clientOpenAI.responses.create({
//         model: "gpt-4.1",
//         input: prompt,
//     });
//
//     if (!res.ok) {
//         const err = await res.text()
//         return NextResponse.json({ error: "OpenAI API error", details: err }, { status: res.status })
//     }
//     const { choices } = await res.json()
//
//     // 4) Retorna
//     return NextResponse.json({
//         rowCount,
//         analysis: choices[0].message.content
//     })
// }

type Metrics = {
    precision: number;
    recall: number;
    f1Score: number;
    latency: number;
};

type AnalyticResult = {
    rowCount: number;
    analysis: {
        temporal: string;
        area: string;
        efetividade: string;
        recomendacao: string;
    };
    metrics: Metrics;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (!startParam || !endParam) {
        return NextResponse.json({ error: "You must pass ?start=yyyy-MM-dd&end=yyyy-MM-dd" }, { status: 400 });
    }

    let start: Date, end: Date;
    try {
        start = parseISO(startParam);
        end = parseISO(endParam);
    } catch {
        return NextResponse.json({ error: "Invalid date format. Use yyyy-MM-dd" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("help-city");
    const all = await db.collection("denuncias").find().toArray();

    // 1) filtra pelo período
    const filtered = all.filter((d) => {
        const c = new Date(d.createdAt);
        return isAfter(c, start) && isBefore(c, end);
    });

    const rowCount = filtered.length;

    // 2) padrão temporal: hora mais frequente
    const countsByHour: Record<number, number> = {};
    filtered.forEach((d) => {
        const h = new Date(d.createdAt).getHours();
        countsByHour[h] = (countsByHour[h] || 0) + 1;
    });
    // 1) Ordena as entradas e pega a primeira (ou um fallback ["0",0])
    const topEntry = Object.entries(countsByHour)
        .sort((a, b) => b[1] - a[1])[0] || ["0", 0]

// 2) Extrai a hora como número
    const bestHour = Number(topEntry[0])

    const temporal = `Pico de ocorrências entre ${bestHour}h e ${bestHour + 1}h`


    // 3) área de risco: região com mais denúncias
    const countsByRegion: Record<string, number> = {};
    filtered.forEach((d) => {
        const region = d.endereco?.split(",")[0].trim() || "Sem região";
        countsByRegion[region] = (countsByRegion[region] || 0) + 1;
    });
    const [topRegion] = Object.entries(countsByRegion)
        .sort((a, b) => b[1] - a[1])[0];
    const area = `${topRegion} teve ${countsByRegion[topRegion]} ocorrências`;

    // 4) efetividade e recomendação (hardcoded/demo)
    const efetividade = `Intervenções simuladas reduziram ocorrências em ${Math.round(Math.random()*50)}%`;
    const recomendacao = `Reforçar patrulhamento em ${topRegion} entre ${bestHour}h e ${bestHour + 2}h`;

    // 5) métricas dummy
    const metrics: Metrics = {
        precision: 90,
        recall: 85,
        f1Score: 0.88,
        latency: 20,
    };

    const result: AnalyticResult = {
        rowCount,
        analysis: { temporal, area, efetividade, recomendacao },
        metrics,
    };

    return NextResponse.json(result, { status: 200 });
}
