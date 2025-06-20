// import type { NextApiRequest } from "next";
// import { EvaluateDenunciaRequest, EvaluateDenunciaResponse } from "@/models/IDenuncia";
// import {classifyImage, decideTypeByImage} from "@/services/classifyImage";
// import {identifyType} from "@/services/identifyType";
// import {NextResponse} from "next/server";
//
// const HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN!;
//
// export async function POST(
//     req: NextApiRequest
// ) {
//     const { description, location, imageBase64 } = req.body as EvaluateDenunciaRequest;
//     if (!description || !location) {
//         NextResponse.json({ error: "Missing fields" });
//     }
//
//     // 1) Classifica sentimento via HF
//     const hfRes = await fetch(
//         "https://api-inference.huggingface.co/models/quadranttechnologies/retail-content-safety-clip-finetuned\n",
//         {
//             headers: { Authorization: `Bearer ${HF_TOKEN}` },
//             method: "POST",
//             body: JSON.stringify({ inputs: description }),
//         }
//     );
//
//     console.log("testando a saída do modelo de IA: ", hfRes)
//     const hfJson = (await hfRes.json()) as Array<{ label: string; score: number }>;
//     const negative = hfJson.find((x) => x.label === "NEGATIVE")?.score ?? 0;
//
//     // 2) Decide severity
//     const severity = negative > 0.8
//         ? "critico"
//         : negative > 0.5
//             ? "Alto"
//             : negative > 0.2
//                 ? "Médio"
//                 : "Baixo";
//
//     // 3) Se veio imagem, classifica e decide o type a partir dela
//     let type: EvaluateDenunciaResponse["type"];
//     if (imageBase64) {
//         const imageResults = await classifyImage(imageBase64);
//         type = decideTypeByImage(imageResults);
//     } else {
//         // fallback para texto, ou outra função de texto:
//         type = identifyType(description);
//     }
//
//     // 4) Monta e retorna a resposta
//     const response: EvaluateDenunciaResponse = {
//         type,
//         severity: severity as EvaluateDenunciaResponse["severity"],
//         confidenceScore: negative,
//     };
//     NextResponse.json(response);
// }
