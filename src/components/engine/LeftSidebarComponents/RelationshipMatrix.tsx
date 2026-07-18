import React, { useRef, useEffect, useMemo } from 'react'
import { Users, User as UserIcon } from 'lucide-react'
import { clsx } from 'clsx'
import { useEngineStore } from '../../../store/engineStore'

const getRelationColor = (value: number) => {
  if (value > 60) return '#22c55e'
  if (value < 40) return '#ef4444'
  return '#eab308'
}

const getRelationLabel = (value: number) => {
  if (value > 60) return 'Friendly'
  if (value < 40) return 'Opps'
  return 'Neutral'
}

interface RelationshipMatrixProps {
  isExpanded: boolean
}

export function RelationshipMatrix({ isExpanded }: RelationshipMatrixProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const relationships = useEngineStore(s => s.relationships) || []
  const playerProfile = useEngineStore(s => s.playerProfile)

  const { nodes, links } = useMemo(() => {
    const cx = 500
    const cy = 400

    const calculatedNodes = [
      { id: 'player', name: playerProfile?.name || 'Player', value: 50, reason: 'Main Character', x: cx, y: cy, isPlayer: true }
    ]
    // building the d3-style node map manually because it's cheaper
    const calculatedLinks: { sourceX: number, sourceY: number, targetX: number, targetY: number, value: number, isNeutral: boolean }[] = []

    const radius = isExpanded ? 220 : 130
    const count = relationships.length

    relationships.forEach((rel, i) => {
      const angle = (i / count) * Math.PI * 2
      const nx = cx + Math.cos(angle) * radius
      const ny = cy + Math.sin(angle) * radius

      calculatedNodes.push({ id: rel.id, name: rel.name, value: rel.value, reason: rel.reason, x: nx, y: ny, isPlayer: false })

      calculatedLinks.push({
        sourceX: cx, sourceY: cy,
        targetX: nx, targetY: ny,
        value: rel.value,
        isNeutral: rel.value >= 40 && rel.value <= 60
      })
    })

    return { nodes: calculatedNodes, links: calculatedLinks }
  }, [relationships, isExpanded, playerProfile])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 500 - containerRef.current.clientWidth / 2
      containerRef.current.scrollTop = 400 - containerRef.current.clientHeight / 2
    }
  }, [isExpanded])

  // poor man's pan and zoom
  const onPointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return
    containerRef.current.dataset.isDragging = 'true'
    containerRef.current.dataset.startX = e.clientX.toString()
    containerRef.current.dataset.startY = e.clientY.toString()
    containerRef.current.dataset.scrollLeft = containerRef.current.scrollLeft.toString()
    containerRef.current.dataset.scrollTop = containerRef.current.scrollTop.toString()
    containerRef.current.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current || containerRef.current.dataset.isDragging !== 'true') return
    const startX = parseFloat(containerRef.current.dataset.startX!)
    const startY = parseFloat(containerRef.current.dataset.startY!)
    const scrollLeft = parseFloat(containerRef.current.dataset.scrollLeft!)
    const scrollTop = parseFloat(containerRef.current.dataset.scrollTop!)
    containerRef.current.scrollLeft = scrollLeft - (e.clientX - startX)
    containerRef.current.scrollTop = scrollTop - (e.clientY - startY)
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (containerRef.current) {
      containerRef.current.dataset.isDragging = 'false'
      containerRef.current.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <section className={clsx(
      'bg-black/40 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)] rounded-2xl p-5 shrink-0 flex flex-col transition-all duration-300 relative overflow-hidden',
      isExpanded ? 'flex-1 min-h-[60vh]' : ''
    )}>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-center mb-5 relative z-10">
        <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2 drop-shadow-md">
          <Users className="w-3.5 h-3.5 text-pink-400" /> Relationship Matrix
        </h3>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={clsx(
          'w-full rounded-xl border border-white/10 bg-black/50 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] overflow-auto relative touch-none cursor-grab active:cursor-grabbing custom-scrollbar z-10',
          isExpanded ? 'flex-1' : 'h-48'
        )}
      >
        <div className="w-[1000px] h-[800px] relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.1))' }}>
            {links.map((link, idx) => (
              <line
                key={idx}
                x1={link.sourceX} y1={link.sourceY}
                x2={link.targetX} y2={link.targetY}
                stroke={getRelationColor(link.value)}
                strokeWidth={isExpanded ? '4' : '2'}
                strokeDasharray={link.isNeutral ? '4 6' : 'none'}
                strokeOpacity={isExpanded ? 0.6 : 0.4}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            ))}
          </svg>

          {nodes.map(node => (
            <div
              key={node.id}
              className={clsx(
                'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 transition-all duration-500',
                node.isPlayer ? 'z-20' : 'z-10'
              )}
              style={{ left: node.x, top: node.y }}
            >
              <div
                className={clsx(
                  'p-2.5 rounded-full border border-white/20 shadow-xl transition-all duration-300 backdrop-blur-md flex items-center justify-center',
                  node.isPlayer ? 'bg-white/20 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.3)]' :
                  node.value > 60 ? 'bg-green-500/20 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                  node.value < 40 ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                  'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]',
                  isExpanded ? 'scale-125 mb-1' : 'scale-100 hover:scale-110'
                )}
                title={node.isPlayer ? 'Player' : `${node.name} (${getRelationLabel(node.value)})`}
              >
                <UserIcon className={clsx(
                  'w-4 h-4 drop-shadow-md',
                  node.isPlayer ? 'text-white' :
                  node.value > 60 ? 'text-green-400' :
                  node.value < 40 ? 'text-red-400' :
                  'text-yellow-400'
                )} />
              </div>

              <div className={clsx(
                'bg-black/80 backdrop-blur-md border border-white/10 rounded-lg flex flex-col items-center pointer-events-none shadow-xl transition-all',
                isExpanded ? 'p-2.5 min-w-[140px] max-w-[200px] gap-1' : 'p-1.5 min-w-[80px]'
              )}>
                <span className={clsx('font-bold text-gray-100 leading-tight tracking-wide drop-shadow-md text-center', isExpanded ? 'text-[12px]' : 'text-[10px]')}>{node.name}</span>

                {isExpanded && !node.isPlayer && node.reason && (
                  <span className="text-gray-400 text-[10px] mt-0.5 text-center italic break-words w-full leading-snug">
                    "{node.reason}"
                  </span>
                )}

                {!node.isPlayer && (
                  <span className={clsx(
                    'font-extrabold leading-tight uppercase tracking-wider drop-shadow-md',
                    isExpanded ? 'text-[10px] mt-1' : 'text-[8px] mt-0.5',
                    node.value > 60 ? 'text-green-400' :
                    node.value < 40 ? 'text-red-400' :
                    'text-yellow-400'
                  )}>
                    {getRelationLabel(node.value)} ({node.value})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
