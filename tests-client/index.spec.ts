import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { startRightbarOverlay } from '../src/index.ts'

describe('rightbar-overlay', () => {
  let container: HTMLElement
  let frame: HTMLElement
  let rightbarCol: HTMLElement
  let rightPanel: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    frame = document.createElement('div')
    frame.style.gridTemplateColumns = '280px 1fr 400px'
    container.appendChild(frame)

    rightbarCol = document.createElement('div')
    rightbarCol.setAttribute('data-rightbar-col', '')
    rightbarCol.style.width = '400px'
    frame.appendChild(rightbarCol)

    rightPanel = document.createElement('div')
    rightPanel.setAttribute('data-sidebar-right-panel', 'push')
    rightPanel.style.width = '400px'
    rightbarCol.appendChild(rightPanel)
  })

  afterEach(() => {
    container.remove()
    localStorage.clear()
  })

  it('should inject overlay styles', () => {
    const overlay = startRightbarOverlay()
    const style = document.getElementById('rightbar-overlay-style')
    expect(style).not.toBeNull()
    expect(style?.textContent).toContain('grid-template-columns')
    overlay.dispose()
  })

  it('should mark the frame with overlay attribute', () => {
    const overlay = startRightbarOverlay()
    expect(frame.hasAttribute('data-rightbar-overlay')).toBe(true)
    overlay.dispose()
  })

  it('should mirror sidebar track width to CSS variable', () => {
    const overlay = startRightbarOverlay()
    expect(frame.style.getPropertyValue('--rightbar-sidebar-track')).toBe('280px')
    overlay.dispose()
  })

  it('should not apply when disabled in localStorage', () => {
    localStorage.setItem('rightbarOverlay.enabled', 'off')
    const overlay = startRightbarOverlay()
    expect(frame.hasAttribute('data-rightbar-overlay')).toBe(false)
    overlay.dispose()
  })

  it('should clean up on dispose', () => {
    const overlay = startRightbarOverlay()
    expect(document.getElementById('rightbar-overlay-style')).not.toBeNull()
    expect(frame.hasAttribute('data-rightbar-overlay')).toBe(true)

    overlay.dispose()

    expect(document.getElementById('rightbar-overlay-style')).toBeNull()
    expect(frame.hasAttribute('data-rightbar-overlay')).toBe(false)
  })

  it('should not re-inject style on multiple starts', () => {
    const overlay1 = startRightbarOverlay()
    const style1 = document.getElementById('rightbar-overlay-style')

    const overlay2 = startRightbarOverlay()
    const style2 = document.getElementById('rightbar-overlay-style')

    expect(style1).toBe(style2)
    overlay1.dispose()
    overlay2.dispose()
  })

  it('should handle missing document gracefully', () => {
    const overlay = startRightbarOverlay({ document: undefined })
    expect(overlay).toBeDefined()
    overlay.dispose()
  })

  it('should handle missing frame gracefully', () => {
    rightbarCol.remove()
    const logSpy = vi.fn()
    const overlay = startRightbarOverlay({ log: logSpy })
    expect(logSpy).toHaveBeenCalledWith('rightbar overlay: frame not found yet')
    overlay.dispose()
  })

  it('should update sidebar track when frame style changes', () => {
    const overlay = startRightbarOverlay()
    expect(frame.style.getPropertyValue('--rightbar-sidebar-track')).toBe('280px')

    // Simulate React updating the frame style
    frame.style.gridTemplateColumns = '300px 1fr 400px'

    // MutationObserver should pick this up
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(frame.style.getPropertyValue('--rightbar-sidebar-track')).toBe('300px')
        overlay.dispose()
        resolve()
      }, 10)
    })
  })
})
