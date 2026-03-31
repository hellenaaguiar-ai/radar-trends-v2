export const runtime = 'edge'

const SYSTEM = `Você é um estrategista de conteúdo especializado na marca pessoal de Hellena Aguiar.

QUEM ELA É: Criadora de opinião. Pega qualquer assunto — notícia, comportamento, literatura, polêmica — e transforma em reflexão com perspectiva própria. Não ensina, não repassa informação. Vende ideias. Posiciona quem ela é pelo que ela pensa.

LINHAS EDITORIAIS:
1. Identidade e construção de si
2. Literatura e referências culturais
3. Comportamento humano e sociedade
4. Mercado digital, ética e influência
5. IA e tecnologia com perspectiva crítica
6. Arte e cinema
7. Bastidores reais
8. Vida real — maternidade, rotina, caos

TOM: Opinião clara. Direta. Reflexiva. Nunca paternalista. Conecta mundos diferentes. Um assunto do noticiário vira uma reflexão sobre comportamento humano, ética, identidade.

NÃO PERTENCE: empreendedorismo feminino como centro, motivacional genérico, tutorial sem perspectiva, política partidária, fitness, emagrecimento, positividade tóxica.

IMPORTANTE: Notícias e pautas quentes do momento são bem-vindas — desde que o ângulo não seja jornalístico, e sim de opinião e posicionamento. Ex: "CPI das bets" não vira conteúdo sobre a CPI, vira conteúdo sobre o que você endossa, o que o seu nome vale, ética na influência.`

const SEARCH_PROMPT = `Pesquise na internet em três frentes simultaneamente:

FRENTE 1 — NOTÍCIAS QUENTES: O que está no topo do noticiário brasileiro AGORA (março 2026)? Busque em portais de notícia, trending topics, o que está gerando debate nacional. Inclua pautas como CPIs, escândalos, movimentos sociais, decisões de mercado, casos envolvendo influenciadores e marcas.

FRENTE 2 — COMPORTAMENTO E CULTURA: O que está em alta em comportamento humano, literatura, cinema, arte, mercado creator, ética digital, IA?

FRENTE 3 — TENDÊNCIAS EMERGENTES: O que está crescendo antes de virar mainstream? Discussões no TikTok, YouTube, podcasts, subcultures, debates em comunidades.

Para cada tema encontrado, analise como ele pode virar OPINIÃO E POSICIONAMENTO para a Hellena — não conteúdo jornalístico, mas reflexão com perspectiva própria.

Retorne EXATAMENTE neste formato:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [data ou período aproximado]
Fontes: [onde foi explorado — portais, plataformas, criadores]
Ângulo: [Como a Hellena transformaria isso em opinião e posicionamento — específico, com a voz dela, 2-3 frases. O tema é só o gatilho, a reflexão é o produto.]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [3 perguntas ou reflexões que ajudem a Hellena a formar e expressar uma opinião — provocativas, profundas, não óbvias]

---

Retorne entre 7 e 9 temas variando entre notícias quentes, comportamento e tendências emergentes. Seja honesto no fit.`

const CUSTOM_PROMPT = (topic) => `Pesquise na internet sobre: "${topic}" — o que está sendo discutido agora, quem está falando, que ângulos estão surgindo, o que está gerando debate, quando surgiu e onde foi explorado.

Depois analise como a Hellena Aguiar poderia transformar isso em opinião e posicionamento com perspectiva própria — não conteúdo jornalístico, mas reflexão que revela quem ela é pelo que ela pensa.

Retorne:

**[TÍTULO DO TEMA]**
Fit: [Alta / Média / Baixa]
Quando: [data ou período aproximado]
Fontes: [onde foi explorado — plataformas, veículos, criadores]
Ângulo: [Como a Hellena transformaria isso em opinião — específico, com a voz dela, 2-3 frases]
Formato: [Reel / Vídeo Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]
Provocações: [3 perguntas ou reflexões que ajudem a Hellena a formar e expressar uma opinião sobre esse tema]`

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY não configurada.' }, { status: 500 })

  const { mode, topic } = await req.json()
  const userMsg = mode === 'custom' ? CUSTOM_PROMPT(topic) : SEARCH_PROMPT

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: SYSTEM,
      tools: [{
        type: 'web_search_20250305',
        name: 'web_search',
        allowed_callers: ['direct']
      }],
      messages: [{ role: 'user', content: userMsg }]
    })
  })

  const data = await res.json()
  if (data.error) return Response.json({ error: data.error.message }, { status: 500 })
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
  return Response.json({ text })
}
