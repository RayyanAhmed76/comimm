import { muteStore, volumeStore, voiceListeners } from '@/lib/audio'

/**
 * Engine-room ambience and event sounds.
 * POC: synthesised with the Web Audio API so that the mix (global mute, separate ambience
 * volume, ducking under the voice) can be validated. The recorded loop and effects delivered
 * with the 3D scene replace the generators below without touching the screens.
 */
export type Sfx = 'alarm' | 'valve' | 'wrench' | 'lock' | 'pumpStart' | 'pumpStop' | 'vacuum'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null
let ambience: { gain: GainNode; stop: () => void } | null = null
let ducked = false
let running = true

const level = () => (muteStore.get() ? 0 : volumeStore.get().ambience * (ducked ? 0.3 : 1))

function apply() {
  if (ctx && master) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.08)
}

function ensure() {
  if (ctx) {
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  }
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = level()
  master.connect(ctx.destination)
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  muteStore.subscribe(apply)
  volumeStore.subscribe(apply)
  // Ambience and effects are ducked while the voice speaks
  voiceListeners.add((speaking) => {
    ducked = speaking
    apply()
  })
  // Browsers only start audio after a user gesture
  const resume = () => void ctx?.resume()
  window.addEventListener('pointerdown', resume, { once: true })
  return ctx
}

function noiseSource(c: AudioContext) {
  const src = c.createBufferSource()
  src.buffer = noise
  src.loop = true
  return src
}

/** Engine-room loop: low drone + filtered rumble. */
export function startAmbience() {
  const c = ensure()
  if (!c || !master || ambience) return
  const gain = c.createGain()
  gain.gain.value = running ? 1 : 0.25
  gain.connect(master)

  const drone = c.createOscillator()
  drone.type = 'sawtooth'
  drone.frequency.value = 55
  const droneLp = c.createBiquadFilter()
  droneLp.type = 'lowpass'
  droneLp.frequency.value = 160
  const droneGain = c.createGain()
  droneGain.gain.value = 0.16
  drone.connect(droneLp).connect(droneGain).connect(gain)

  const hum = c.createOscillator()
  hum.type = 'sine'
  hum.frequency.value = 82.5
  const humGain = c.createGain()
  humGain.gain.value = 0.07
  hum.connect(humGain).connect(gain)

  const rumble = noiseSource(c)
  const band = c.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 320
  band.Q.value = 0.6
  const rumbleGain = c.createGain()
  rumbleGain.gain.value = 0.09
  rumble.connect(band).connect(rumbleGain).connect(gain)

  drone.start()
  hum.start()
  rumble.start()
  ambience = {
    gain,
    stop: () => {
      drone.stop()
      hum.stop()
      rumble.stop()
      gain.disconnect()
    },
  }
}

export function stopAmbience() {
  ambience?.stop()
  ambience = null
  running = true
}

/** The loop depends on the plant state: quieter once the installation is stopped. */
export function setPlantRunning(on: boolean) {
  running = on
  if (ctx && ambience) ambience.gain.gain.setTargetAtTime(on ? 1 : 0.25, ctx.currentTime, 0.6)
}

function tone(c: AudioContext, type: OscillatorType, from: number, to: number, at: number, dur: number, vol: number) {
  const o = c.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(from, at)
  o.frequency.linearRampToValueAtTime(to, at + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(vol, at + Math.min(0.05, dur / 4))
  g.gain.linearRampToValueAtTime(0, at + dur)
  o.connect(g).connect(master!)
  o.start(at)
  o.stop(at + dur + 0.05)
}

function burst(c: AudioContext, type: BiquadFilterType, from: number, to: number, at: number, dur: number, vol: number) {
  const src = noiseSource(c)
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.setValueAtTime(from, at)
  f.frequency.linearRampToValueAtTime(to, at + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0, at)
  g.gain.linearRampToValueAtTime(vol, at + Math.min(0.03, dur / 3))
  g.gain.linearRampToValueAtTime(0, at + dur)
  src.connect(f).connect(g).connect(master!)
  src.start(at)
  src.stop(at + dur + 0.05)
}

export function playSfx(name: Sfx) {
  const c = ensure()
  if (!c || !master) return
  const t = c.currentTime + 0.02
  switch (name) {
    case 'alarm':
      for (let i = 0; i < 4; i++) tone(c, 'square', i % 2 ? 660 : 880, i % 2 ? 660 : 880, t + i * 0.28, 0.22, 0.12)
      break
    case 'valve':
      burst(c, 'bandpass', 900, 300, t, 0.6, 0.35)
      break
    case 'wrench':
      for (let i = 0; i < 3; i++) burst(c, 'highpass', 2200, 2200, t + i * 0.16, 0.05, 0.5)
      break
    case 'lock':
      burst(c, 'highpass', 3000, 3000, t, 0.04, 0.5)
      tone(c, 'triangle', 420, 300, t + 0.02, 0.09, 0.15)
      break
    case 'pumpStart':
      tone(c, 'sawtooth', 38, 110, t, 1.3, 0.22)
      break
    case 'pumpStop':
      tone(c, 'sawtooth', 110, 34, t, 1.3, 0.22)
      break
    case 'vacuum':
      burst(c, 'highpass', 1200, 2600, t, 1.4, 0.18)
      break
  }
}
