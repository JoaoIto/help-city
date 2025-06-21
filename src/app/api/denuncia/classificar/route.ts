import { NextResponse } from "next/server";

export async function POST(request: Request) {
    // 1) ler o body
    let body: never;
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON" },
            { status: 400 }
        );
    }

    // 2) validar
    const { text } = body;
    if (typeof text !== "string") {
        return NextResponse.json(
            { error: "Provide { text: string }" },
            { status: 400 }
        );
    }

    // 3) (exemplo de chamada à HF Inference API)
    const HF_TOKEN = process.env.HF_TOKEN;
    if (!HF_TOKEN) {
        return NextResponse.json(
            { error: "Missing HF_TOKEN env var" },
            { status: 500 }
        );
    }

    try {
        const hfRes = await fetch(
            "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: text }),
            }
        );
        if (!hfRes.ok) {
            const err = await hfRes.text();
            return NextResponse.json(
                { error: `Hugging Face error: ${err}` },
                { status: hfRes.status }
            );
        }
        const data = await hfRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        console.error("Inference error:", e);
        return NextResponse.json(
            { error: "Internal inference error" },
            { status: 500 }
        );
    }
}