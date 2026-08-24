import React, { Suspense, useState, useEffect, useRef, memo } from 'react'
import Spline from '@splinetool/react-spline'
import type { Application } from '@splinetool/runtime'

interface SplineBackgroundProps {
  sceneUrl?: string
  className?: string
}

class SplineErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('Spline 3D background error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0512] via-[#050505] to-[#12080a] opacity-90" />
      )
    }
    return this.props.children
  }
}

export const SplineBackground: React.FC<SplineBackgroundProps> = memo(function SplineBackground({
  sceneUrl = 'https://prod.spline.design/SzS6LoO3u0oyakFA/scene.splinecode',
  className = '',
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const splineRef = useRef<Application | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number | null>(null)

  // Tracking mouse coordinates (-1 to 1) and smooth lerped values
  const targetMouse = useRef({ x: 0, y: 0 })
  const currentMouse = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  function onLoad(splineApp: Application) {
    splineRef.current = splineApp
    setIsLoaded(true)
  }

  // Smooth mouse move & scroll tracking
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      targetMouse.current.x = nx
      targetMouse.current.y = ny
    }

    const onScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight || 1
      const scrollRatio = window.scrollY / maxScroll
      targetMouse.current.y = -(scrollRatio * 2 - 1)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Continuous Dynamic Procedural 3D Wave & Parallax Motion Loop
  useEffect(() => {
    let active = true

    const animate = () => {
      if (!active) return

      timeRef.current += 0.022
      const t = timeRef.current

      // Smooth lerp mouse towards target
      currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.05
      currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.05

      // Continuous organic 3D wave harmonics
      const waveX = Math.sin(t * 1.1) * 26 + Math.sin(t * 0.45) * 14
      const waveY = Math.cos(t * 0.9) * 20 + Math.sin(t * 0.6) * 12
      const waveRotZ = Math.sin(t * 0.5) * 2.8 + Math.cos(t * 0.3) * 1.2
      const waveRotX = Math.sin(t * 0.7) * 2.2
      const waveRotY = Math.cos(t * 0.6) * 2.5
      const waveScale = 1.06 + Math.sin(t * 0.7) * 0.03

      // Dynamic 3D transform on container
      if (containerRef.current) {
        const totalX = (currentMouse.current.x * 40 + waveX).toFixed(2)
        const totalY = (-currentMouse.current.y * 30 + waveY).toFixed(2)
        const totalRotZ = (waveRotZ + currentMouse.current.x * 2.5).toFixed(2)
        const totalRotX = (-currentMouse.current.y * 4.0 + waveRotX).toFixed(2)
        const totalRotY = (currentMouse.current.x * 4.5 + waveRotY).toFixed(2)

        containerRef.current.style.transform = `perspective(1200px) translate3d(${totalX}px, ${totalY}px, 0px) rotateX(${totalRotX}deg) rotateY(${totalRotY}deg) rotateZ(${totalRotZ}deg) scale(${waveScale.toFixed(3)})`
      }

      // Procedurally animate individual Spline objects in the 3D scene
      if (splineRef.current && typeof splineRef.current.getAllObjects === 'function') {
        try {
          const objects = splineRef.current.getAllObjects()
          if (objects && objects.length > 0) {
            objects.forEach((obj, idx) => {
              if (obj && obj.rotation) {
                const phase = idx * 0.4
                obj.rotation.x = (obj.rotation.x || 0) + Math.sin(t + phase) * 0.0008
                obj.rotation.y = (obj.rotation.y || 0) + Math.cos(t + phase) * 0.0012
              }
            })
          }
        } catch {
          // ignore
        }
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      active = false
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isLoaded])

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden select-none ${className}`}
    >
      {/* 3D Dynamic Animated Transform Layer with smooth GPU acceleration */}
      <div
        ref={containerRef}
        className="w-full h-full will-change-transform transform-gpu transition-opacity duration-1000"
        style={{
          width: '114vw',
          height: '114vh',
          marginLeft: '-7vw',
          marginTop: '-7vh',
        }}
      >
        <SplineErrorBoundary>
          <Suspense
            fallback={
              <div className="absolute inset-0 bg-[#050505] transition-opacity duration-1000" />
            }
          >
            <div
              className={`w-full h-full transition-opacity duration-1000 ${
                isLoaded ? 'opacity-85' : 'opacity-0'
              }`}
            >
              <Spline
                scene={sceneUrl}
                onLoad={onLoad}
                className="w-full h-full pointer-events-auto"
              />
            </div>
          </Suspense>
        </SplineErrorBoundary>
      </div>

      {/* Pulsing subtle ambient cosmic glow lights */}
      <div className="absolute top-0 right-1/4 w-[750px] h-[750px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse duration-1000" />
      <div className="absolute bottom-0 left-1/4 w-[750px] h-[750px] bg-orange-600/10 rounded-full blur-[160px] pointer-events-none animate-pulse duration-700" />

      {/* Ambient Vignette & Contrast Overlay so all text and cards remain ultra-readable */}
      <div className="absolute inset-0 bg-radial-[at_center_center] from-transparent via-[#050505]/30 to-[#050505]/85 pointer-events-none" />
    </div>
  )
})
