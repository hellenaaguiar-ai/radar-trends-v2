'use client'
import { useState, useRef } from 'react'

const C = {
  cream: '#F5EDD8', ink: '#1A1208', espresso: '#2E1B0E', leather: '#5C3320',
  rust: '#8B4A2A', amber: '#A67C3D', amberDim: '#7A5C2E', sage: '#4A5740',
  parchment: '#EDE0C4', parchDark: '#C8B896', aged: '#D4C4A0',
}

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`

const F = "Raleway, sans-serif"

// ─── PARSERS ──────────────────────────────────────────────────────────────────
function parseTrends(raw) {
  const items = []
  const blocks = raw.split(/\n---+\n|\n(?=\*\*[^*])/g)
  for (const block of blocks) {
    if (block.trim().length < 20) continue
    const title = block.match(/\*\*(.+?)\*\*/)?.[1]?.replace(/[*#]/g, '').trim()
    const fit = block.match(/Fit:\s*(Alta|Média|Media|Baixa)/i)?.[1]
    const quando = block.match(/Quando:\s*([^\n]{3,80})/i)?.[1]?.trim()
    const fontes = block.match(/Fontes:\s*([^\n]{3,200})/i)?.[1]?.trim()
    const angle = block.match(/Ângulo:\s*([\s\S]{10,400}?)(?=\nFormato:|\n---|\n\*\*|$)/i)?.[1]?.replace(/[*_]/g, '').trim().replace(/\n+/g, ' ')
    const format = block.match(/Formato:\s*([^\n]{3,60})/i)?.[1]?.trim()
    const timing = block.match(/Timing:\s*([^\n]{3,40})/i)?.[1]?.trim()
    const provocacoesRaw = block.match(/Provocações:\s*([\s\S]{10,600}?)(?=\n---|\n\*\*|$)/i)?.[1]?.trim()
    const provocacoes = provocacoesRaw ? provocacoesRaw.split(/\n[-\d.]\s*|\n\n/).map(p => p.trim()).filter(p => p.length > 10) : []
    if (title && fit) items.push({ title, fit: fit.charAt(0).toUpperCase() + fit.slice(1), quando: quando || '', fontes: fontes || '', angle: angle || '', format: format || '', timing: timing || '', provocacoes })
  }
  return items
}

function parseReverse(raw) {
  const field = (label) => raw.match(new RegExp(`${label}[^\\n]*\\n([\\s\\S]+?)(?=\\n[A-ZÁÉÍÓÃÂÊÔÇ]{3,}[:\\s]|---IDEIAS|$)`, 'i'))?.[1]?.trim() || ''
  const idea = (fmt) => {
    const escaped = fmt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const block = raw.match(new RegExp(`${escaped}:[\\s\\S]+?(?=\\n(?:VIDEO LONGO|VÍDEO LONGO|CARROSSEL|REEL):|$)`, 'i'))?.[0] || ''
    return {
      tema: block.match(/Tema:\s*(.+)/i)?.[1]?.trim() || '',
      abertura: (block.match(/Abertura:\s*(.+)/i)?.[1] || block.match(/Capa:\s*(.+)/i)?.[1] || '').trim(),
      estrutura: block.match(/Estrutura:\s*([\s\S]+?)(?=\nPor que|$)/i)?.[1]?.trim() || '',
      porque: block.match(/Por que[^:]*:\s*(.+)/i)?.[1]?.trim() || '',
    }
  }
  return {
    titulo: raw.match(/TITULO:\s*(.+)/i)?.[1]?.trim() || '',
    canal: raw.match(/CANAL:\s*(.+)/i)?.[1]?.trim() || '',
    performance: raw.match(/PERFORMANCE:\s*(.+)/i)?.[1]?.trim() || '',
    gancho: field('GANCHO'),
    arco: field('ARCO NARRATIVO'),
    gatilhos: field('GATILHOS EMOCIONAIS'),
    porque: field('POR QUE FUNCIONOU'),
    ideias: { reel: idea('REEL'), video: idea('VIDEO LONGO'), carrossel: idea('CARROSSEL') },
  }
}

// ─── UI ATOMS ─────────────────────────────────────────────────────────────────
function Label({ children }) {
  return <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.amberDim, fontFamily: F, marginBottom: 10 }}>{children}</div>
}

function Card({ children, bg, style = {} }) {
  return (
    <div style={{ background: bg || C.cream, backgroundImage: NOISE, border: `1px solid ${C.aged}`, borderRadius: 4, padding: '20px 22px', ...style }}>
      {children}
    </div>
  )
}

function FitBadge({ fit }) {
  const map = { Alta: [C.sage, C.cream], Média: [C.amberDim, C.cream], Media: [C.amberDim, C.cream], Baixa: [C.aged, C.espresso] }
  const [bg, color] = map[fit] || [C.aged, C.espresso]
  return <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 3, background: bg, color, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: F, whiteSpace: 'nowrap', flexShrink: 0 }}>{fit}</span>
}

function Tag({ children }) {
  return <span style={{ fontSize: 10, padding: '3px 9px', borderRadius: 3, background: C.parchDark, color: C.espresso, fontFamily: F, letterSpacing: '0.06em' }}>{children}</span>
}

function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? C.aged : C.espresso, color: C.cream, border: 'none', borderRadius: 4, padding: '11px 24px', fontSize: 11, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F, letterSpacing: '0.12em', textTransform: 'uppercase', transition: 'background .15s' }}>
      {children}
    </button>
  )
}

function GhostBtn({ onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: 'transparent', color: C.amberDim, border: `1.5px solid ${C.parchDark}`, borderRadius: 4, padding: '10px 18px', fontSize: 11, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}

function FilterBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? C.espresso : 'transparent', color: active ? C.cream : C.amberDim, border: `1.5px solid ${active ? C.espresso : C.parchDark}`, borderRadius: 4, padding: '7px 16px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: F, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all .15s' }}>
      {children}
    </button>
  )
}

function Input({ value, onChange, onKeyDown, placeholder }) {
  return (
    <input value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder}
      style={{ flex: 1, background: C.parchment, border: `1px solid ${C.parchDark}`, borderRadius: 4, padding: '11px 16px', fontSize: 13, color: C.ink, fontFamily: F, outline: 'none' }} />
  )
}

function Divider() {
  return <div style={{ height: 1, background: C.aged, margin: '24px 0' }} />
}

// ─── TREND CARD ───────────────────────────────────────────────────────────────
function TrendCard({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      {/* Topo */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, lineHeight: 1.4, fontFamily: F }}>{item.title}</div>
        <FitBadge fit={item.fit} />
      </div>

      {/* Quando e Fontes */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
        {item.quando && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, color: C.amberDim, fontFamily: F, letterSpacing: '0.06em' }}>📅 {item.quando}</span>
          </div>
        )}
        {item.fontes && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, color: C.amberDim, fontFamily: F, letterSpacing: '0.06em' }}>🔍 {item.fontes}</span>
          </div>
        )}
      </div>

      {/* Ângulo */}
      {item.angle && <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.7, margin: '0 0 12px', fontFamily: F }}>{item.angle}</p>}

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: item.provocacoes?.length ? 12 : 0 }}>
        {item.format && <Tag>{item.format}</Tag>}
        {item.timing && <Tag>{item.timing}</Tag>}
      </div>

      {/* Provocações */}
      {item.provocacoes?.length > 0 && (
        <>
          <button onClick={() => setOpen(!open)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 11, color: C.amberDim, fontFamily: F, letterSpacing: '0.08em', padding: '6px 0', textTransform: 'uppercase', fontWeight: 600 }}>
            {open ? '▲ Fechar provocações' : '▼ Ver provocações'}
          </button>
          {open && (
            <div style={{ marginTop: 12, background: C.parchment, backgroundImage: NOISE, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 3px 3px 0', padding: '12px 16px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.amberDim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 10, fontFamily: F }}>Para você pensar e criar sua opinião</div>
              {item.provocacoes.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < item.provocacoes.length - 1 ? 10 : 0 }}>
                  <span style={{ color: C.amber, fontWeight: 700, fontFamily: F, flexShrink: 0 }}>—</span>
                  <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.6, margin: 0, fontFamily: F, fontStyle: 'italic' }}>{p}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Card>
  )
}

// ─── IDEIA CARD ───────────────────────────────────────────────────────────────
function IdeiaCard({ format, idea, url }) {
  const [sending, setSending] = useState(false)
  const [sentUrl, setSentUrl] = useState(null)
  const [erro, setErro] = useState('')
  if (!idea?.tema) return null

  const map = {
    'REEL': { label: 'Reel', bg: C.sage, color: C.cream },
    'VIDEO LONGO': { label: 'Vídeo Longo', bg: C.rust, color: C.cream },
    'CARROSSEL': { label: 'Carrossel', bg: C.amberDim, color: C.cream },
  }
  const { label, bg, color } = map[format] || { label: format, bg: C.aged, color: C.ink }

  async function enviar() {
    setSending(true); setErro('')
    try {
      const desc = `Abertura:\n"${idea.abertura}"\n\nEstrutura:\n${idea.estrutura}\n\nPor que funciona:\n${idea.porque}\n\nReferência: ${url}`
      const res = await fetch('/api/clickup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: idea.tema, description: desc, format }) })
      const data = await res.json()
      if (data.url) setSentUrl(data.url)
      else setErro(data.error || 'Erro ao criar tarefa.')
    } catch (e) { setErro('Erro de conexão.') }
    setSending(false)
  }

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 3, background: bg, color, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: F }}>{label}</span>
        {sentUrl
          ? <a href={sentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: C.sage, fontWeight: 700, textDecoration: 'none', fontFamily: F, letterSpacing: '0.05em' }}>Abrir no ClickUp →</a>
          : <button onClick={enviar} disabled={sending} style={{ fontSize: 11, color: C.amberDim, background: 'transparent', border: `1px solid ${C.parchDark}`, borderRadius: 3, padding: '5px 12px', cursor: sending ? 'not-allowed' : 'pointer', fontFamily: F, letterSpacing: '0.06em', opacity: sending ? 0.5 : 1 }}>
              {sending ? 'Enviando...' : 'Enviar pro ClickUp'}
            </button>
        }
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 12, lineHeight: 1.4, fontFamily: F }}>{idea.tema}</div>
      {idea.abertura && (
        <div style={{ background: C.parchment, backgroundImage: NOISE, borderLeft: `3px solid ${C.amber}`, padding: '10px 14px', marginBottom: 12, borderRadius: '0 3px 3px 0' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.amberDim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontFamily: F }}>Abertura</div>
          <div style={{ fontSize: 13, color: C.leather, fontStyle: 'italic', lineHeight: 1.6, fontFamily: F }}>"{idea.abertura}"</div>
        </div>
      )}
      {idea.estrutura && <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.7, margin: '0 0 10px', fontFamily: F }}>{idea.estrutura}</p>}
      {idea.porque && <p style={{ fontSize: 12, color: C.amberDim, lineHeight: 1.6, margin: 0, fontFamily: F }}>{idea.porque}</p>}
      {erro && <p style={{ fontSize: 11, color: C.rust, marginTop: 8, fontFamily: F }}>{erro}</p>}
    </Card>
  )
}

// ─── ABA TRENDS ──────────────────────────────────────────────────────────────
function TrendsTab() {
  const [results, setResults] = useState([])
  const [filter, setFilter] = useState('todos')
  const [status, setStatus] = useState('')
  const [loadingRun, setLoadingRun] = useState(false)
  const [loadingCustom, setLoadingCustom] = useState(false)
  const [topic, setTopic] = useState('')
  const timer = useRef(null)

  const STEPS = [
    'Pesquisando o que está em alta agora...',
    'Varrendo literatura, comportamento, mercado digital...',
    'Identificando datas e fontes...',
    'Cruzando com suas linhas editoriais...',
    'Gerando ângulos de opinião e provocações...',
  ]

  function startSteps() {
    let i = 0; setStatus(STEPS[0])
    timer.current = setInterval(() => { if (++i < STEPS.length) setStatus(STEPS[i]) }, 3500)
  }

  async function buscarTrends() {
    setLoadingRun(true); startSteps()
    try {
      const res = await fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'search' }) })
      const data = await res.json()
      clearInterval(timer.current)
      if (data.error) { setStatus('Erro: ' + data.error); setLoadingRun(false); return }
      const parsed = parseTrends(data.text)
      setResults(parsed)
      setStatus(parsed.length ? `${parsed.length} temas encontrados · ${parsed.filter(r => r.fit === 'Alta').length} com fit alto` : 'Nenhum resultado. Tente novamente.')
    } catch (e) { clearInterval(timer.current); setStatus('Erro de conexão. Tente novamente.') }
    setLoadingRun(false)
  }

  async function analisarTema() {
    if (!topic.trim()) return
    setLoadingCustom(true); setStatus(`Pesquisando: "${topic}"...`)
    try {
      const res = await fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'custom', topic }) })
      const data = await res.json()
      if (data.error) { setStatus('Erro: ' + data.error); setLoadingCustom(false); return }
      const parsed = parseTrends(data.text)
      setResults(prev => [...parsed, ...prev])
      setStatus(parsed.length ? `Tema analisado · Fit: ${parsed[0]?.fit}` : 'Concluído.')
      setTopic('')
    } catch (e) { setStatus('Erro de conexão. Tente novamente.') }
    setLoadingCustom(false)
  }

  const filtered = filter === 'todos' ? results : results.filter(r => r.fit === filter)

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <PrimaryBtn onClick={buscarTrends} disabled={loadingRun}>
          {loadingRun ? 'Buscando...' : 'Buscar Trends Agora'}
        </PrimaryBtn>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {['todos', 'Alta', 'Média', 'Baixa'].map(f => (
            <FilterBtn key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f === 'todos' ? 'Todos' : f === 'Alta' ? 'Fit Alto' : f === 'Média' ? 'Fit Médio' : 'Fit Baixo'}
            </FilterBtn>
          ))}
        </div>
      )}

      {status && <p style={{ fontSize: 12, color: C.amberDim, marginBottom: 16, fontFamily: F, letterSpacing: '0.03em' }}>{status}</p>}

      <Divider />

      <Label>Ou analise um tema específico</Label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <Input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && analisarTema()} placeholder="Ex: ética no mercado de influência, livros em alta, IA substituindo trabalho criativo..." />
        <GhostBtn onClick={analisarTema} disabled={loadingCustom}>{loadingCustom ? 'Analisando...' : 'Analisar'}</GhostBtn>
      </div>

      {filtered.length === 0 && !loadingRun ? (
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ color: C.amberDim, fontSize: 13, lineHeight: 1.8, fontFamily: F }}>
            Clique em "Buscar Trends Agora" e o agente vai pesquisar autonomamente<br />
            o que está em alta e cruzar com as suas linhas editoriais.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((item, i) => <TrendCard key={i} item={item} />)}
        </div>
      )}
    </div>
  )
}

// ─── ABA ENGENHARIA REVERSA ───────────────────────────────────────────────────
function ReverseTab() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState(null)
  const timer = useRef(null)

  const STEPS = [
    'Buscando informações do vídeo...',
    'Analisando gancho e estrutura narrativa...',
    'Identificando gatilhos emocionais...',
    'Gerando ideias com a sua voz e opinião...',
  ]

  function startSteps() {
    let i = 0; setStatus(STEPS[0])
    timer.current = setInterval(() => { if (++i < STEPS.length) setStatus(STEPS[i]) }, 4500)
  }

  async function analisar() {
    if (!url.trim()) return
    setLoading(true); setResult(null); startSteps()
    try {
      const res = await fetch('/api/reverse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await res.json()
      clearInterval(timer.current)
      if (data.error) { setStatus('Erro: ' + data.error) }
      else { setResult(parseReverse(data.text)); setStatus('') }
    } catch (e) { clearInterval(timer.current); setStatus('Erro de conexão. Tente novamente.') }
    setLoading(false)
  }

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Label>Cole a URL do vídeo de referência</Label>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && analisar()} placeholder="https://youtube.com/watch?v=...   ou link do TikTok / Instagram" />
          <PrimaryBtn onClick={analisar} disabled={loading}>{loading ? 'Analisando...' : 'Analisar'}</PrimaryBtn>
        </div>
        <p style={{ fontSize: 11, color: C.amberDim, margin: '8px 0 0', fontFamily: F, letterSpacing: '0.04em' }}>
          Funciona com YouTube, TikTok e Instagram
        </p>
      </Card>

      {status && <p style={{ fontSize: 12, color: C.amberDim, marginBottom: 16, fontFamily: F }}>{status}</p>}

      {!result && !loading && (
        <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
          <p style={{ color: C.amberDim, fontSize: 13, lineHeight: 1.8, fontFamily: F }}>
            Cole o link de um vídeo que performou fora da curva.<br />
            O agente disseca a estrutura e gera ideias de<br />
            <strong style={{ color: C.leather }}>Reel</strong>, <strong style={{ color: C.leather }}>Vídeo Longo</strong> e <strong style={{ color: C.leather }}>Carrossel</strong> com a sua voz e opinião.
          </p>
        </Card>
      )}

      {result && (
        <>
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4, fontFamily: F }}>{result.titulo || url}</div>
            <div style={{ fontSize: 12, color: C.amberDim, fontFamily: F }}>{result.canal}{result.performance ? ` · ${result.performance}` : ''}</div>
          </Card>

          <Card bg={C.parchment} style={{ marginBottom: 20 }}>
            <Label>Engenharia Reversa</Label>
            {[['Gancho (primeiros 30s)', result.gancho], ['Arco Narrativo', result.arco], ['Gatilhos Emocionais', result.gatilhos], ['Por que Funcionou', result.porque]].map(([label, value]) => value ? (
              <div key={label} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.amberDim, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4, fontFamily: F }}>{label}</div>
                <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.7, margin: 0, fontFamily: F }}>{value}</p>
              </div>
            ) : null)}
          </Card>

          <Label>Ideias para o seu canal</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['REEL', result.ideias.reel], ['VIDEO LONGO', result.ideias.video], ['CARROSSEL', result.ideias.carrossel]].map(([fmt, idea]) => (
              <IdeiaCard key={fmt} format={fmt} idea={idea} url={url} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState('trends')

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${C.cream}; }
        input::placeholder { color: ${C.parchDark}; }
        input:focus { border-color: ${C.amber} !important; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.cream, backgroundImage: NOISE, padding: '40px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', color: C.amberDim, textTransform: 'uppercase', fontFamily: F, marginBottom: 10 }}>
              Hellena Aguiar · Agente de Conteúdo
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 700, color: C.ink, lineHeight: 1.1, fontFamily: F, marginBottom: 10, letterSpacing: '-0.01em' }}>
              Content<br />Intelligence
            </h1>
            <div style={{ width: 36, height: 2, background: C.amber, marginBottom: 12 }} />
            <p style={{ fontSize: 13, color: C.leather, lineHeight: 1.6, fontFamily: F }}>
              Trends em tempo real · Engenharia reversa · Ideias prontas pro ClickUp
            </p>
          </div>

          <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: `2px solid ${C.parchDark}` }}>
            {[['trends', 'Radar de Trends'], ['reverse', 'Engenharia Reversa']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: 'transparent', border: 'none',
                borderBottom: tab === id ? `2px solid ${C.espresso}` : '2px solid transparent',
                marginBottom: -2, padding: '10px 24px',
                fontSize: 12, fontWeight: tab === id ? 700 : 500,
                color: tab === id ? C.ink : C.amberDim,
                cursor: 'pointer', fontFamily: F,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                transition: 'all .15s'
              }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'trends' ? <TrendsTab /> : <ReverseTab />}
        </div>
      </div>
    </>
  )
}
