# Help City - Plataforma de IA Preditiva para Segurança Pública

## Descrição do Sistema

**Help City** é uma plataforma web fullstack desenvolvida em Next.js (React) e Node.js, que utiliza modelos de IA pré-treinados para monitorar, classificar e prever desordens urbanas com foco em segurança pública. O sistema integra denúncias de cidadãos, análise de imagens e processamento de linguagem natural para gerar insights e alertas que ajudam o poder público a agir de forma proativa.

## Problemática

Cidades grandes e médias frequentemente enfrentam desafios de segurança pública relacionados a:

* Falta de iluminação pública em áreas residenciais e de lazer.
* Vandalismo e pichações que indicam degradação urbana.
* Ocorrências de assalto e uso de drogas em espaços públicos.
* Percepção de insegurança por parte dos cidadãos, mesmo em locais com pouca criminalidade real.

Esses fatores não apenas aumentam o risco de incidentes, mas também afetam a qualidade de vida e a sensação de bem-estar da população. O poder público muitas vezes age de forma reativa, atendendo chamados somente após a ocorrência de crimes.

## Solução Proposta

A **Help City** propõe uma solução de **IA preditiva e colaborativa** que:

1. **Recebe e Processa Denúncias de Cidadãos**

    * Formulário de envio com descrição de texto, foto (imagem Base64) e geolocalização (latitude e longitude).
    * Classificação inicial de tipo de risco via regras de palavras-chave (`identifyType`).

2. **Análise com IA Pré-treinada**

    * Classificação de sentimento/texto usando modelo DistilBERT para determinar gravidade (severity).
    * Classificação zero-shot de imagens usando CLIP (modelo `openai/clip-vit-base-patch32`) para detectar categorias de desordem urbana.
    * (Opcional) Moderação de conteúdo “safe/unsafe” com modelo `quadranttechnologies/retail-content-safety-clip-finetuned`.

3. **Preditiva e Sugestão de Intervenção**

    * Algoritmo de séries temporais (por exemplo, Prophet) ou clustering (KMeans) para prever zonas críticas futuras.
    * Regras CPTED (Crime Prevention Through Environmental Design) aplicadas como preditores: iluminação, ocupação, desordem visual.

4. **Visualização e Ação**

    * Mapa interativo (React-Leaflet) com marcadores coloridos por nível de gravidade.
    * Dashboard com gráficos (Recharts) e lista das top-5 áreas de maior risco.
    * Alertas automáticos enviados a agentes públicos para reforço de patrulhamento ou reparos de infraestrutura.

## O Que o Sistema Faz

* **Coleta de Dados**: recebe inputs de usuários e imagens.
* **Classificação Automática**: transforma texto e imagem em categorias e scores de risco.
* **Armazenamento Estruturado**: mantém um banco de denúncias avaliadas com timestamps.
* **Renderização em Mapa 3D**: exibição em mapa de Brasília com pontos de risco.
* **Previsão de Riscos**: sugere locais e horários que podem demandar atenção futura.
* **Sugestões de Intervenção**: recomendações baseadas em CPTED e análise de padrões.

## Tecnologias Utilizadas

* **Frontend**: Next.js, React, React-Leaflet, Recharts
* **Backend**: Node.js, API Routes (App Router), fetch
* **IA / ML**:

    * Hugging Face Inference API (DistilBERT, CLIP zero-shot)
    * Lógica customizada de keywords (`identifyType`)
    * (Futuro) Prophet / KMeans para previsão
* **Banco de Dados**: PostgreSQL com PostGIS (ou MongoDB)
* **Autenticação**: JWT (Opcional para agentes públicos)

## Próximos Passos

1. Implementar endpoint de avaliação de imagem e texto.
2. Integrar algoritmo preditivo com dados simulados.
3. Finalizar dashboard e roteiros de alertas.
4. Preparar apresentação e demonstração para o hackathon.

---

*Help City* busca unir **tecnologia**, **IA** e **engajamento cidadão** para construir cidades mais seguras e colaborativas.



This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
