import { useEffect, useRef, useState } from 'react'
import { Crosshair, Maximize, Minus, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { useLoc } from '@/lib/i18n'
import { partName, type PartId } from '@/data/content'

/**
 * Freshwater generator — interactive schematic used by every module (Web & VR preview).
 * One fixed drawing: parts stay centred, pipes are connected, the drawing scales to its
 * container (no overflow). Exploded mode spreads the parts and disconnects the pipes.
 */

const W = 1000
const H = 560
const CX = 500
const CY = 280

type PartDef = {
  id: PartId
  cx: number
  cy: number
  r: number
  label: { x: number; y: number; anchor?: 'start' | 'middle' | 'end' }
  explode?: { dx: number; dy: number }
  draw: (s: { fill: string; stroke: string; sw: number }) => React.ReactNode
}

const valve = (cx: number, cy: number) => (s: { fill: string; stroke: string; sw: number }) => (
  <g>
    <path d={`M${cx - 14} ${cy - 10} L${cx + 14} ${cy + 10} L${cx + 14} ${cy - 10} L${cx - 14} ${cy + 10} Z`} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} strokeLinejoin="round" />
    <line x1={cx} y1={cy} x2={cx} y2={cy - 20} stroke={s.stroke} strokeWidth={s.sw} />
    <line x1={cx - 9} y1={cy - 20} x2={cx + 9} y2={cy - 20} stroke={s.stroke} strokeWidth={s.sw + 1} strokeLinecap="round" />
  </g>
)

const gauge = (cx: number, cy: number, r: number) => (s: { fill: string; stroke: string; sw: number }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
    <line x1={cx} y1={cy} x2={cx + r * 0.55} y2={cy - r * 0.5} stroke={s.stroke} strokeWidth={2} strokeLinecap="round" />
    <circle cx={cx} cy={cy} r={2} fill={s.stroke} />
  </g>
)

const PARTS: PartDef[] = [
  {
    id: 'separator', cx: 430, cy: 240, r: 190, label: { x: 430, y: 445 },
    draw: (s) => <rect x={330} y={60} width={200} height={360} rx={44} fill={s.fill} fillOpacity={0.35} stroke={s.stroke} strokeWidth={s.sw + 1} />,
  },
  {
    id: 'condenser', cx: 430, cy: 135, r: 70, label: { x: 430, y: 128 }, explode: { dx: 0, dy: -60 },
    draw: (s) => (
      <g>
        <rect x={360} y={90} width={140} height={90} rx={8} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={372 + i * 14} y1={98} x2={372 + i * 14} y2={172} stroke={s.stroke} strokeOpacity={0.45} strokeWidth={2} />)}
      </g>
    ),
  },
  {
    id: 'demister', cx: 430, cy: 205, r: 36, label: { x: 515, y: 209, anchor: 'start' }, explode: { dx: 0, dy: -10 },
    draw: (s) => (
      <g>
        <rect x={360} y={198} width={140} height={14} rx={4} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={366 + i * 10} y1={199} x2={372 + i * 10} y2={211} stroke={s.stroke} strokeOpacity={0.6} strokeWidth={1.5} />)}
      </g>
    ),
  },
  {
    id: 'evaporator', cx: 430, cy: 307, r: 75, label: { x: 430, y: 300 }, explode: { dx: 0, dy: 45 },
    draw: (s) => (
      <g>
        <rect x={360} y={232} width={140} height={150} rx={8} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={372 + i * 14} y1={240} x2={372 + i * 14} y2={374} stroke={s.stroke} strokeOpacity={0.45} strokeWidth={2} />)}
      </g>
    ),
  },
  { id: 'vacuumGauge', cx: 430, cy: 34, r: 18, label: { x: 455, y: 30, anchor: 'start' }, draw: gauge(430, 34, 16) },
  {
    id: 'airVent', cx: 356, cy: 50, r: 14, label: { x: 340, y: 44, anchor: 'end' },
    draw: (s) => (
      <g>
        <rect x={348} y={44} width={16} height={14} rx={3} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <line x1={356} y1={44} x2={356} y2={36} stroke={s.stroke} strokeWidth={3} strokeLinecap="round" />
      </g>
    ),
  },
  {
    id: 'brineGauge', cx: 541, cy: 353, r: 30, label: { x: 556, y: 350, anchor: 'start' },
    draw: (s) => (
      <g>
        <rect x={534} y={318} width={14} height={70} rx={5} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <rect x={537} y={352} width={8} height={33} rx={2} fill="#94a3b8" fillOpacity={0.8} />
      </g>
    ),
  },
  { id: 'jacketOutlet', cx: 220, cy: 270, r: 18, label: { x: 220, y: 300 }, draw: valve(220, 270) },
  { id: 'jacketInlet', cx: 220, cy: 350, r: 18, label: { x: 220, y: 380 }, draw: valve(220, 350) },
  {
    id: 'controlPanel', cx: 105, cy: 115, r: 62, label: { x: 105, y: 190 },
    draw: (s) => (
      <g>
        <rect x={40} y={60} width={130} height={110} rx={10} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <rect x={54} y={74} width={102} height={34} rx={4} fill="#0a1628" stroke={s.stroke} strokeOpacity={0.5} />
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={62 + i * 28} cy={135} r={7} fill={i === 0 ? '#22c55e' : i === 3 ? '#ef4444' : '#38bdf8'} fillOpacity={0.8} />)}
        <text x={105} y={96} textAnchor="middle" fontSize={11} fill="#7dd3fc" fontFamily="monospace">FWG</text>
      </g>
    ),
  },
  {
    id: 'logbook', cx: 212, cy: 148, r: 22, label: { x: 212, y: 190 },
    draw: (s) => (
      <g>
        <rect x={194} y={128} width={36} height={42} rx={3} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        {[0, 1, 2].map((i) => <line key={i} x1={201} y1={140 + i * 9} x2={223} y2={140 + i * 9} stroke={s.stroke} strokeOpacity={0.6} strokeWidth={1.5} />)}
      </g>
    ),
  },
  {
    id: 'ejector', cx: 660, cy: 250, r: 44, label: { x: 660, y: 288 },
    draw: (s) => <path d="M600 240 L690 238 L720 244 L720 256 L690 262 L600 260 Z" fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} strokeLinejoin="round" />,
  },
  { id: 'ejectorGauge', cx: 620, cy: 212, r: 14, label: { x: 604, y: 208, anchor: 'end' }, draw: gauge(620, 212, 12) },
  { id: 'seawaterFeed', cx: 700, cy: 312, r: 18, label: { x: 700, y: 342 }, draw: valve(700, 312) },
  { id: 'dischargeValve', cx: 760, cy: 385, r: 18, label: { x: 782, y: 389, anchor: 'start' }, draw: valve(760, 385) },
  {
    id: 'ejectorPump', cx: 760, cy: 470, r: 30, label: { x: 760, y: 522 },
    draw: (s) => (
      <g>
        <circle cx={760} cy={470} r={28} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <path d="M746 470 L760 456 L774 470 L760 484 Z" fill="none" stroke={s.stroke} strokeWidth={2} />
      </g>
    ),
  },
  { id: 'suctionValve', cx: 880, cy: 470, r: 18, label: { x: 880, y: 500 }, draw: valve(880, 470) },
  { id: 'overboardValve', cx: 880, cy: 200, r: 18, label: { x: 880, y: 230 }, draw: valve(880, 200) },
  {
    id: 'freshwaterPump', cx: 430, cy: 505, r: 24, label: { x: 462, y: 530, anchor: 'start' },
    draw: (s) => (
      <g>
        <circle cx={430} cy={505} r={22} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <path d="M419 505 L430 494 L441 505 L430 516 Z" fill="none" stroke={s.stroke} strokeWidth={2} />
      </g>
    ),
  },
  {
    id: 'salinometer', cx: 330, cy: 505, r: 20, label: { x: 330, y: 540 },
    draw: (s) => (
      <g>
        <rect x={312} y={490} width={36} height={30} rx={5} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <text x={330} y={510} textAnchor="middle" fontSize={10} fill="#7dd3fc" fontFamily="monospace">ppm</text>
      </g>
    ),
  },
  { id: 'dumpValve', cx: 250, cy: 505, r: 18, label: { x: 250, y: 540 }, draw: valve(250, 505) },
  {
    id: 'flowmeter', cx: 160, cy: 505, r: 18, label: { x: 160, y: 540 },
    draw: (s) => (
      <g>
        <circle cx={160} cy={505} r={16} fill={s.fill} stroke={s.stroke} strokeWidth={s.sw} />
        <path d="M150 505 H170 M165 500 L170 505 L165 510" fill="none" stroke={s.stroke} strokeWidth={2} />
      </g>
    ),
  },
]

/** Pipes drawn between the assembled positions — colour-coded per fluid. */
const PIPES: { d: string; color: string }[] = [
  { d: 'M30 270 H360', color: '#f59e0b' },
  { d: 'M30 350 H360', color: '#f59e0b' },
  { d: 'M985 470 H788', color: '#38bdf8' },
  { d: 'M760 442 V120 H500', color: '#38bdf8' },
  { d: 'M760 250 H720', color: '#38bdf8' },
  { d: 'M760 312 H500', color: '#38bdf8' },
  { d: 'M530 400 H640 V262', color: '#94a3b8' },
  { d: 'M690 238 V200 H985', color: '#94a3b8' },
  { d: 'M620 224 V239', color: '#94a3b8' },
  { d: 'M430 50 V60', color: '#94a3b8' },
  { d: 'M430 420 V483', color: '#34d399' },
  { d: 'M408 505 H30', color: '#34d399' },
  { d: 'M250 517 V552', color: '#34d399' },
  { d: 'M170 115 H330', color: '#64748b' },
]

const FLOW_LABELS = [
  { x: 30, y: 262, text: 'jacketIn', anchor: 'start' },
  { x: 990, y: 462, text: 'seaIn', anchor: 'end' },
  { x: 990, y: 192, text: 'overboard', anchor: 'end' },
  { x: 30, y: 497, text: 'fwTank', anchor: 'start' },
] as const

export type MachineViewProps = {
  highlight?: PartId[]
  wrong?: PartId[]
  guide?: PartId | null
  showLabels?: boolean
  exploded?: boolean
  onPartClick?: (id: PartId) => void
  flash?: { part: PartId; ok: boolean } | null
  /** Part the view frames automatically (zoom + centre) whenever it changes */
  focus?: PartId | null
  gauges?: React.ReactNode
  controls?: React.ReactNode
  className?: string
  hideFlowLabels?: boolean
  dimOthers?: boolean
  /** Wheel zoom — switch off when the view sits inside a scrolling page */
  wheelZoom?: boolean
  /** Small readouts pinned above a part (instrument readings) */
  tags?: { part: PartId; text: string; tone?: 'ok' | 'warn' }[]
}

type View = { z: number; x: number; y: number }

/** Inner margin (drawing units) so that nothing touches the edge of the container. */
const MARGIN = 28
const MAX_ZOOM = 6
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function MachineView({
  highlight = [],
  wrong = [],
  guide = null,
  showLabels = true,
  exploded = false,
  onPartClick,
  flash = null,
  focus = null,
  gauges,
  controls,
  className,
  hideFlowLabels = false,
  dimOthers = false,
  wheelZoom = true,
  tags = [],
}: MachineViewProps) {
  const { t } = useTranslation()
  const loc = useLoc()
  const svgRef = useRef<SVGSVGElement>(null)
  const anim = useRef(0)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef({ startX: 0, startY: 0, dragging: false, suppressClick: false })

  const pad = (exploded ? 60 : 0) + MARGIN
  const bw = W + pad * 2
  const bh = H + pad * 2
  const clampView = (v: View): View => {
    const z = clamp(v.z, 1, MAX_ZOOM)
    const hw = bw / z / 2
    const hh = bh / z / 2
    return { z, x: clamp(v.x, -pad + hw, W + pad - hw), y: clamp(v.y, -pad + hh, H + pad - hh) }
  }
  const [rawView, setView] = useState<View>({ z: 1, x: CX, y: CY })
  const view = clampView(rawView)
  const vbW = bw / view.z
  const vbH = bh / view.z

  const offset = (p: PartDef) => {
    if (!exploded) return { dx: 0, dy: 0 }
    if (p.explode) return p.explode
    if (p.id === 'separator') return { dx: 0, dy: 0 }
    return { dx: (p.cx - CX) * 0.14, dy: (p.cy - CY) * 0.14 }
  }

  const animateTo = (target: View) => {
    cancelAnimationFrame(anim.current)
    const to = clampView(target)
    // No animation frames in a background tab: jump straight to the target
    if (document.hidden) return setView(to)
    let from: View | null = null
    const t0 = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 350)
      const e = 1 - Math.pow(1 - k, 3)
      setView((cur) => {
        from ??= clampView(cur)
        return { z: from.z + (to.z - from.z) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e }
      })
      if (k < 1) anim.current = requestAnimationFrame(tick)
    }
    anim.current = requestAnimationFrame(tick)
  }

  /** Zoom and centre on a part */
  const frame = (id: PartId) => {
    const p = PARTS.find((x) => x.id === id)
    if (!p) return
    const o = offset(p)
    animateTo({ z: clamp(Math.min(bw / (p.r * 7), bh / (p.r * 5)), 1.5, 4), x: p.cx + o.dx, y: p.cy + o.dy })
  }
  const recenter = () => animateTo({ z: 1, x: CX, y: CY })

  const toSvg = (clientX: number, clientY: number) => {
    const m = svgRef.current?.getScreenCTM()
    if (!m) return { x: CX, y: CY }
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse())
    return { x: p.x, y: p.y }
  }

  /** Zoom by `factor`, keeping the point `at` (drawing units) under the cursor */
  const zoomAt = (factor: number, at?: { x: number; y: number }) =>
    setView((cur) => {
      const c = clampView(cur)
      const z = clamp(c.z * factor, 1, MAX_ZOOM)
      const a = at ?? { x: c.x, y: c.y }
      const k = c.z / z
      return clampView({ z, x: a.x - (a.x - c.x) * k, y: a.y - (a.y - c.y) * k })
    })
  const zoomStep = (factor: number) => animateTo({ ...view, z: clamp(view.z * factor, 1, MAX_ZOOM) })

  // Auto-frame the focused part (Identification question, reference sheet…)
  useEffect(() => {
    if (focus) frame(focus)
    else recenter()
    return () => cancelAnimationFrame(anim.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, exploded])

  // Wheel zoom centred on the cursor (needs a non-passive listener to stop the page scroll)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !wheelZoom) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cancelAnimationFrame(anim.current)
      zoomAt(Math.exp(-e.deltaY * 0.0015), toSvg(e.clientX, e.clientY))
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wheelZoom, exploded])

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) gesture.current = { startX: e.clientX, startY: e.clientY, dragging: false, suppressClick: false }
  }
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId)
    if (!prev) return
    const cur = { x: e.clientX, y: e.clientY }
    const g = gesture.current
    if (pointers.current.size === 1) {
      // Drag = pan (a small threshold keeps plain clicks on parts working)
      if (!g.dragging && Math.hypot(cur.x - g.startX, cur.y - g.startY) < 5) return
      if (!g.dragging) {
        g.dragging = true
        g.suppressClick = true
        cancelAnimationFrame(anim.current)
        e.currentTarget.setPointerCapture(e.pointerId)
      }
      const a = toSvg(prev.x, prev.y)
      const b = toSvg(cur.x, cur.y)
      setView((c) => clampView({ ...c, x: c.x - (b.x - a.x), y: c.y - (b.y - a.y) }))
    } else if (pointers.current.size === 2) {
      // Pinch = zoom centred between the two fingers
      const other = [...pointers.current.entries()].find(([id]) => id !== e.pointerId)![1]
      const before = Math.hypot(prev.x - other.x, prev.y - other.y)
      const after = Math.hypot(cur.x - other.x, cur.y - other.y)
      g.suppressClick = true
      if (before > 0) zoomAt(after / before, toSvg((cur.x + other.x) / 2, (cur.y + other.y) / 2))
    }
    pointers.current.set(e.pointerId, cur)
  }
  const onPointerEnd = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) gesture.current.dragging = false
  }

  const onDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const id = (e.target as Element).closest('[data-part]')?.getAttribute('data-part') as PartId | null
    // On an exercise scene a double-click on a part is two answers: only the background zooms
    if (id && onPartClick) return
    if (id && id !== 'separator') frame(id)
    else {
      const at = toSvg(e.clientX, e.clientY)
      animateTo({ z: clamp(view.z * 2, 1, MAX_ZOOM), x: at.x, y: at.y })
    }
  }

  const guidePart = PARTS.find((p) => p.id === guide)
  const target = guide ?? focus ?? (highlight.length === 1 ? highlight[0] : wrong.length === 1 ? wrong[0] : null)
  const atHome = view.z === 1
  const btn =
    'flex h-9 items-center justify-center gap-1.5 rounded-full bg-navy-950/80 px-2.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-navy-950/80'

  return (
    <div className={cn('flex h-full min-h-[240px] w-full flex-col gap-2', className)}>
      {gauges && <div className="flex shrink-0 flex-wrap gap-2">{gauges}</div>}
      <svg
        ref={svgRef}
        viewBox={`${view.x - vbW / 2} ${view.y - vbH / 2} ${vbW} ${vbH}`}
        preserveAspectRatio="xMidYMid meet"
        className={cn('h-full min-h-0 w-full flex-1 touch-none select-none', view.z > 1 && 'cursor-grab active:cursor-grabbing')}
        role="img"
        aria-label={t('machine.ariaLabel')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onDoubleClick={onDoubleClick}
        onClickCapture={(e) => {
          if (gesture.current.suppressClick) {
            e.stopPropagation()
            gesture.current.suppressClick = false
          }
        }}
      >
        <g style={{ opacity: exploded ? 0.18 : 1, transition: 'opacity 700ms' }} strokeDasharray={exploded ? '6 8' : undefined}>
          {PIPES.map((p, i) => (
            <path key={i} d={p.d} stroke={p.color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
          ))}
        </g>
        {!hideFlowLabels &&
          FLOW_LABELS.map((f) => (
            <text key={f.text} x={f.x} y={f.y} textAnchor={f.anchor} fontSize={11} fill="#94a3b8" fontWeight={600}>
              {t(`machine.flow.${f.text}`)}
            </text>
          ))}

        {PARTS.map((p, idx) => {
          const isHi = highlight.includes(p.id)
          const isWrong = wrong.includes(p.id)
          const isFlash = flash?.part === p.id
          const stroke = isFlash ? (flash!.ok ? '#22c55e' : '#ef4444') : isWrong ? '#ef4444' : isHi ? '#fb923c' : '#7dd3fc'
          const fill = isWrong ? '#3b1d2a' : isHi ? '#3a2a1e' : '#1c3558'
          const sw = isHi || isWrong || isFlash ? 3.5 : 2
          const { dx, dy } = offset(p)
          const dim = dimOthers && highlight.length > 0 && !isHi && !isWrong && p.id !== 'separator'
          const interactive = !!onPartClick
          return (
            <g
              key={p.id}
              data-part={p.id}
              style={{ transform: `translate(${dx}px, ${dy}px)`, transition: 'transform 900ms ease-in-out, opacity 400ms', opacity: dim ? 0.35 : 1 }}
              className={cn(interactive && 'cursor-pointer focus:outline-none')}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-label={interactive ? (showLabels ? loc(partName(p.id)) : t('machine.partN', { n: idx + 1 })) : undefined}
              onClick={interactive ? () => onPartClick!(p.id) : undefined}
              onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && onPartClick!(p.id) : undefined}
            >
              {p.draw({ fill, stroke, sw })}
              {(isHi || isWrong) && p.id !== 'separator' && (
                <circle cx={p.cx} cy={p.cy} r={p.r + 10} fill="none" stroke={isWrong ? '#ef4444' : '#fb923c'} strokeOpacity={0.55} strokeWidth={2}>
                  <animate attributeName="stroke-opacity" values="0.7;0.15;0.7" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              {interactive && p.r <= 30 && <circle cx={p.cx} cy={p.cy} r={Math.max(p.r, 18)} fill="transparent" />}
              {showLabels && (
                <text
                  x={p.label.x}
                  y={p.label.y}
                  textAnchor={p.label.anchor ?? 'middle'}
                  fontSize={p.id === 'separator' ? 13 : 11.5}
                  fontWeight={700}
                  fill={isWrong ? '#fca5a5' : isHi ? '#fdba74' : '#e2e8f0'}
                  style={{ paintOrder: 'stroke' }}
                  stroke="#0e1e38"
                  strokeWidth={4}
                >
                  {loc(partName(p.id))}
                </text>
              )}
            </g>
          )
        })}

        {tags.map((tag) => {
          const p = PARTS.find((x) => x.id === tag.part)
          if (!p) return null
          const w = tag.text.length * 6.4 + 16
          const y = p.cy - Math.min(p.r, 40) - 30
          const color = tag.tone === 'warn' ? '#fb923c' : '#34d399'
          return (
            <g key={tag.part} pointerEvents="none">
              <rect x={p.cx - w / 2} y={y} width={w} height={22} rx={6} fill="#0a1628" stroke={color} strokeWidth={1.5} />
              <text x={p.cx} y={y + 15} textAnchor="middle" fontSize={11.5} fontWeight={700} fill={color} fontFamily="monospace">
                {tag.text}
              </text>
            </g>
          )
        })}

        {guidePart && (
          <g pointerEvents="none" style={{ transform: `translate(${offset(guidePart).dx}px, ${offset(guidePart).dy}px)` }}>
            <circle cx={guidePart.cx} cy={guidePart.cy} r={guidePart.r + 22} fill="#fb923c" fillOpacity={0.12} stroke="#fb923c" strokeWidth={3}>
              <animate attributeName="r" values={`${guidePart.r + 16};${guidePart.r + 28};${guidePart.r + 16}`} dur="1.4s" repeatCount="indefinite" />
            </circle>
            <g>
              <animateTransform attributeName="transform" type="translate" values="0 -8;0 4;0 -8" dur="1s" repeatCount="indefinite" />
              <path d={`M${guidePart.cx} ${guidePart.cy - guidePart.r - 26} l-14 -22 h9 v-26 h10 v26 h9 z`} fill="#fb923c" stroke="#0e1e38" strokeWidth={2} />
            </g>
          </g>
        )}
      </svg>

      {/* Controls sit under the scene, never on top of it */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => zoomStep(1.5)} disabled={view.z >= MAX_ZOOM} className={cn(btn, 'w-9 px-0')} aria-label={t('machine.zoomIn')} title={t('machine.zoomIn')}>
            <Plus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => zoomStep(1 / 1.5)} disabled={atHome} className={cn(btn, 'w-9 px-0')} aria-label={t('machine.zoomOut')} title={t('machine.zoomOut')}>
            <Minus className="h-4 w-4" />
          </button>
          <button type="button" onClick={recenter} disabled={atHome} className={btn} title={t('machine.recenter')}>
            <Maximize className="h-4 w-4" />
            <span className="hidden sm:inline">{t('machine.recenter')}</span>
          </button>
          {target && (
            <button type="button" onClick={() => frame(target)} className={btn} title={t('machine.targetPart')}>
              <Crosshair className="h-4 w-4" />
              <span className="hidden sm:inline">{t('machine.targetPart')}</span>
            </button>
          )}
        </div>
        {controls && <div className="flex flex-wrap justify-end gap-2">{controls}</div>}
      </div>
    </div>
  )
}

/** Small render of a single part — catalogue cards and parts lists. */
export function PartThumb({ part, className }: { part: PartId; className?: string }) {
  const p = PARTS.find((x) => x.id === part)
  if (!p) return null
  const r = Math.max(p.r, 18) * 1.3 + 6
  return (
    <svg viewBox={`${p.cx - r} ${p.cy - r} ${r * 2} ${r * 2}`} className={className} aria-hidden="true">
      {p.draw({ fill: '#1c3558', stroke: '#7dd3fc', sw: Math.max(2, r / 20) })}
    </svg>
  )
}
