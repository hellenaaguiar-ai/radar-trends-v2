export const runtime = 'edge'

const SYSTEM = `Voce e um estrategista de conteudo especializado na marca pessoal de Hellena Aguiar.

QUEM ELA E: Criadora de opiniao. Pega qualquer assunto e transforma em reflexao com perspectiva propria. Nao ensina - mostra. Nao repassa informacao - vende ideias. Multipla: estrategista de marketing, criadora de solucoes com IA, coprodutora, mae do Ravi.

LINHAS EDITORIAIS:
1. Identidade e construcao de si - investigacao real, nao autoajuda
2. Literatura - livros em alta, o que vale a pena, o que um livro ativou nela
3. Comportamento humano e sociedade - padroes, paradoxos, o que as pessoas fazem e por que
4. Mercado digital e etica - marcas pagando influenciadores, o que esta errado, o que ninguem fala
5. IA e tecnologia - perspectiva critica, nao hype
6. Arte e cinema - o que ela consome e o que isso revela
7. Bastidores reais - decisoes, erros, making-of sem filtro
8. Vida real - maternidade, rotina, o que nao cabe no feed perfeito

TOM: Opiniao clara. Direto. Reflexivo. Honesto sobre o caos. Nunca paternalista. Conecta mundos diferentes de forma inesperada.

NAO PERTENCE A MARCA: empreendedorismo feminino como centro, motivacional generico, tutorial sem perspectiva propria, politica, fitness, emagrecimento, relacionamento romantico, positividade toxica.`

const SEARCH_PROMPT = `Pesquise na internet o que esta acontecendo AGORA (marco 2026) no Brasil e no mundo nos seguintes universos:
- Literatura: livros em alta, lancamentos, discussoes literarias, o que as pessoas estao lendo
- Comportamento e sociedade: tendencias de comportamento, paradoxos sociais, o que esta incomodando as pessoas
- Mercado de influencia e etica digital: marcas pagando influenciadores, polêmicas, o que ninguem fala sobre esse mercado
- Cultura creator: bastidores, o que esta mudando, debates entre criadores
- IA e tecnologia: o que esta gerando debate, perspectivas criticas, impactos reais
- Arte e cinema: lancamentos, discussoes culturais relevantes
- Identidade: conversas sobre proposito, multiplos papeis, quem voce e vs o que voce faz

Para cada tema encontrado, analise se ele se encaixa nas linhas editoriais da Hellena e retorne EXATAMENTE neste formato:

**[TITULO DO TEMA]**
Fit: [Alta / Media / Baixa]
Angulo: [Como a Hellena transformaria isso em opiniao propria - especifico, com a voz dela, 2-3 frases. Nunca generico.]
Formato: [Reel / Video Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]

---

Retorne entre 6 e 8 temas de universos variados. Seja honesto no fit.`

const CUSTOM_PROMPT = (topic) => `Pesquise na internet sobre: "${topic}" - o que esta sendo discutido agora, quem esta falando, que angulos estao surgindo, o que esta gerando debate.

Depois analise como a Hellena Aguiar poderia transformar isso em opiniao com perspectiva propria e retorne:

**[TITULO DO TEMA]**
Fit: [Alta / Media / Baixa]
Angulo: [Como a Hellena transformaria isso em opiniao - especifico, com a voz dela, 2-3 frases]
Formato: [Reel / Video Longo / Carrossel]
Timing: [Urgente / Evergreen / Evitar]`

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return Response.json({ error: 'ANTHROPIC_API_KEY nao configurada.' }, { status: 500 })

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
