import type { L } from '@/lib/i18n'

/* ------------------------------------------------------------------ */
/*  Pedagogical content — bilingual (EN / FR).                         */
/*  Draft prepared for the POC; final wording to be validated by COMIM. */
/* ------------------------------------------------------------------ */

export type PartId =
  | 'separator'
  | 'evaporator'
  | 'condenser'
  | 'demister'
  | 'ejector'
  | 'ejectorPump'
  | 'suctionValve'
  | 'dischargeValve'
  | 'overboardValve'
  | 'airVent'
  | 'vacuumGauge'
  | 'jacketInlet'
  | 'jacketOutlet'
  | 'seawaterFeed'
  | 'brineGauge'
  | 'ejectorGauge'
  | 'freshwaterPump'
  | 'flowmeter'
  | 'salinometer'
  | 'dumpValve'
  | 'controlPanel'
  | 'logbook'

export const COURSE_NAME: L = { en: 'Freshwater generator', fr: 'Générateur d’eau douce' }

/* ----------------------------- Catalogue ---------------------------- */

export type ComponentType = 'exchanger' | 'valve' | 'pump' | 'instrument' | 'other'
export const COMPONENT_TYPES: ComponentType[] = ['exchanger', 'valve', 'pump', 'instrument', 'other']

/**
 * `hint` is only used as the Identification hint. `note` is the neutral technical note shown
 * in the catalogue (what it is, where, normal range) — no procedure order, no fault cause.
 */
type BaseComponent = { id: string; part: PartId; name: L; definition: L; hint: L }
export type Component = BaseComponent & { type: ComponentType; note: L }

const baseCatalogue: BaseComponent[] = [
  { id: 'c01', part: 'separator', name: { en: 'Separator vessel', fr: 'Séparateur (corps)' }, definition: { en: 'Main shell where seawater evaporates and vapour separates from brine under vacuum.', fr: 'Corps principal où l’eau de mer s’évapore et où la vapeur se sépare de la saumure sous vide.' }, hint: { en: 'The largest volume of the unit.', fr: 'Le plus grand volume de l’appareil.' } },
  { id: 'c02', part: 'evaporator', name: { en: 'Evaporator plate pack', fr: 'Plaques de l’évaporateur' }, definition: { en: 'Heated plates where seawater turns into vapour.', fr: 'Plaques chauffées où l’eau de mer se transforme en vapeur.' }, hint: { en: 'Heated by the engine jacket water — hot side of the unit.', fr: 'Chauffées par l’eau de refroidissement moteur — côté chaud de l’appareil.' } },
  { id: 'c03', part: 'condenser', name: { en: 'Condenser plate pack', fr: 'Plaques du condenseur' }, definition: { en: 'Cooled plates where the vapour condenses back into fresh water.', fr: 'Plaques refroidies où la vapeur se condense en eau douce.' }, hint: { en: 'Cooled by seawater — opposite temperature direction to the evaporator.', fr: 'Refroidies par l’eau de mer — sens de température opposé à l’évaporateur.' } },
  { id: 'c04', part: 'demister', name: { en: 'Demister', fr: 'Dévésiculeur (demister)' }, definition: { en: 'Mesh screen that retains seawater droplets carried by the vapour.', fr: 'Grille qui retient les gouttelettes d’eau de mer entraînées par la vapeur.' }, hint: { en: 'Between evaporator and condenser, in the vapour path.', fr: 'Entre l’évaporateur et le condenseur, sur le trajet de la vapeur.' } },
  { id: 'c05', part: 'ejector', name: { en: 'Combined brine/air ejector', fr: 'Éjecteur combiné saumure/air' }, definition: { en: 'Extracts brine and non-condensable gases and maintains the vacuum.', fr: 'Extrait la saumure et les gaz incondensables et maintient le vide.' }, hint: { en: 'Two functions at once — liquid and gas extraction.', fr: 'Deux fonctions à la fois — extraction liquide et gaz.' } },
  { id: 'c06', part: 'ejector', name: { en: 'Ejector nozzle', fr: 'Buse de l’éjecteur' }, definition: { en: 'Converging nozzle that accelerates the driving seawater to create suction.', fr: 'Buse convergente qui accélère l’eau motrice pour créer l’aspiration.' }, hint: { en: 'A foreign body here blocks the vacuum and brine extraction.', fr: 'Un corps étranger ici bloque le vide et l’extraction de saumure.' } },
  { id: 'c07', part: 'ejector', name: { en: 'Ejector inspection cover', fr: 'Couvercle de visite de l’éjecteur' }, definition: { en: 'Bolted cover giving access to the ejector nozzle.', fr: 'Couvercle boulonné donnant accès à la buse de l’éjecteur.' }, hint: { en: 'Open only after lockout and draining.', fr: 'À ouvrir uniquement après consignation et vidange.' } },
  { id: 'c08', part: 'ejectorPump', name: { en: 'Ejector pump', fr: 'Pompe de l’éjecteur' }, definition: { en: 'Centrifugal pump supplying driving seawater to the ejector and condenser.', fr: 'Pompe centrifuge qui alimente l’éjecteur et le condenseur en eau de mer motrice.' }, hint: { en: 'Started once its suction, discharge and overboard valves are open.', fr: 'Démarrée une fois ses vannes d’aspiration, de refoulement et de rejet ouvertes.' } },
  { id: 'c09', part: 'suctionValve', name: { en: 'Pump suction valve', fr: 'Vanne d’aspiration de la pompe' }, definition: { en: 'Isolates the sea chest from the ejector pump inlet.', fr: 'Isole la prise d’eau de mer de l’entrée de la pompe.' }, hint: { en: 'First valve opened in the startup sequence.', fr: 'Première vanne ouverte dans la séquence de démarrage.' } },
  { id: 'c10', part: 'dischargeValve', name: { en: 'Pump discharge valve', fr: 'Vanne de refoulement de la pompe' }, definition: { en: 'Isolates the ejector pump outlet.', fr: 'Isole la sortie de la pompe de l’éjecteur.' }, hint: { en: 'Opened right after the suction valve.', fr: 'Ouverte juste après la vanne d’aspiration.' } },
  { id: 'c11', part: 'overboardValve', name: { en: 'Overboard discharge valve', fr: 'Vanne de rejet à la mer' }, definition: { en: 'Lets the ejector outlet (brine and gases) flow overboard.', fr: 'Permet le rejet à la mer de la sortie de l’éjecteur (saumure et gaz).' }, hint: { en: 'Must be open before the pump starts.', fr: 'Doit être ouverte avant le démarrage de la pompe.' } },
  { id: 'c12', part: 'airVent', name: { en: 'Air vent screw', fr: 'Purgeur d’air' }, definition: { en: 'Small screw on top of the shell used to vent air when stopped.', fr: 'Petite vis en haut du corps servant à purger l’air à l’arrêt.' }, hint: { en: 'Closed before building the vacuum.', fr: 'Fermée avant de faire le vide.' } },
  { id: 'c13', part: 'vacuumGauge', name: { en: 'Vacuum gauge', fr: 'Vacuomètre' }, definition: { en: 'Shows the vacuum level inside the separator vessel.', fr: 'Indique le niveau de vide dans le séparateur.' }, hint: { en: 'Must reach 90 % within about 15 s after pump start.', fr: 'Doit atteindre 90 % en 15 s environ après le démarrage de la pompe.' } },
  { id: 'c14', part: 'jacketInlet', name: { en: 'Jacket water inlet valve', fr: 'Vanne d’entrée eau de refroidissement moteur' }, definition: { en: 'Admits hot engine jacket water to the evaporator.', fr: 'Admet l’eau chaude du circuit moteur dans l’évaporateur.' }, hint: { en: 'Opened only once the vacuum is established.', fr: 'Ouverte seulement une fois le vide établi.' } },
  { id: 'c15', part: 'jacketOutlet', name: { en: 'Jacket water outlet valve', fr: 'Vanne de sortie eau de refroidissement moteur' }, definition: { en: 'Returns the jacket water to the engine cooling circuit.', fr: 'Renvoie l’eau vers le circuit de refroidissement du moteur.' }, hint: { en: 'Paired with the inlet valve.', fr: 'Associée à la vanne d’entrée.' } },
  { id: 'c16', part: 'jacketInlet', name: { en: 'Jacket water by-pass valve', fr: 'Vanne de by-pass eau moteur' }, definition: { en: 'Regulates how much jacket water flows through the evaporator.', fr: 'Règle le débit d’eau moteur passant par l’évaporateur.' }, hint: { en: 'Controls the evaporation temperature.', fr: 'Contrôle la température d’évaporation.' } },
  { id: 'c17', part: 'seawaterFeed', name: { en: 'Seawater feed valve', fr: 'Vanne d’alimentation eau de mer' }, definition: { en: 'Admits treated feed seawater into the evaporator.', fr: 'Admet l’eau de mer d’alimentation traitée dans l’évaporateur.' }, hint: { en: 'Opened after the jacket water.', fr: 'Ouverte après l’eau moteur.' } },
  { id: 'c18', part: 'seawaterFeed', name: { en: 'Feed water orifice', fr: 'Diaphragme d’alimentation' }, definition: { en: 'Calibrated orifice limiting the feed water flow.', fr: 'Diaphragme calibré limitant le débit d’alimentation.' }, hint: { en: 'Prevents flooding of the evaporator.', fr: 'Évite le noyage de l’évaporateur.' } },
  { id: 'c19', part: 'seawaterFeed', name: { en: 'Feed treatment dosing unit', fr: 'Doseur de traitement d’eau' }, definition: { en: 'Injects anti-scale chemical into the feed water.', fr: 'Injecte un produit anti-tartre dans l’eau d’alimentation.' }, hint: { en: 'Protects the evaporator plates from scaling.', fr: 'Protège les plaques de l’évaporateur de l’entartrage.' } },
  { id: 'c20', part: 'brineGauge', name: { en: 'Brine level sight glass', fr: 'Voyant de niveau de saumure' }, definition: { en: 'Shows the brine level at the bottom of the separator.', fr: 'Indique le niveau de saumure en bas du séparateur.' }, hint: { en: 'A rising level points to an extraction problem.', fr: 'Un niveau qui monte signale un problème d’extraction.' } },
  { id: 'c21', part: 'ejectorGauge', name: { en: 'Ejector pressure gauge', fr: 'Manomètre de l’éjecteur' }, definition: { en: 'Shows the driving water pressure upstream of the ejector.', fr: 'Indique la pression de l’eau motrice en amont de l’éjecteur.' }, hint: { en: 'Abnormally high with a blocked nozzle.', fr: 'Anormalement haute si la buse est obstruée.' } },
  { id: 'c22', part: 'freshwaterPump', name: { en: 'Fresh water (distillate) pump', fr: 'Pompe d’eau douce (distillat)' }, definition: { en: 'Pumps the produced fresh water to the storage tanks.', fr: 'Envoie l’eau douce produite vers les caisses de stockage.' }, hint: { en: 'Started when distillation begins.', fr: 'Démarrée au début de la distillation.' } },
  { id: 'c23', part: 'flowmeter', name: { en: 'Flowmeter', fr: 'Débitmètre' }, definition: { en: 'Measures the fresh water production rate.', fr: 'Mesure le débit d’eau douce produite.' }, hint: { en: 'Check that the flow is stable.', fr: 'Vérifier que le débit est stable.' } },
  { id: 'c24', part: 'salinometer', name: { en: 'Salinometer', fr: 'Salinomètre' }, definition: { en: 'Measures the salt content of the produced water.', fr: 'Mesure la teneur en sel de l’eau produite.' }, hint: { en: 'The only instrument driving the automatic dump valve.', fr: 'Seul instrument qui commande la vanne de rejet automatique.' } },
  { id: 'c25', part: 'dumpValve', name: { en: 'Solenoid dump valve', fr: 'Électrovanne de rejet' }, definition: { en: 'Sends off-spec water back to the bilge/sea when salinity is too high.', fr: 'Renvoie l’eau hors norme à la cale/mer si la salinité est trop élevée.' }, hint: { en: 'Commanded by the salinometer.', fr: 'Commandée par le salinomètre.' } },
  { id: 'c26', part: 'controlPanel', name: { en: 'Control panel', fr: 'Tableau de commande' }, definition: { en: 'Starts/stops the pumps and displays alarms.', fr: 'Démarre/arrête les pompes et affiche les alarmes.' }, hint: { en: 'Used to stop the installation before any intervention.', fr: 'Sert à arrêter l’installation avant toute intervention.' } },
  { id: 'c27', part: 'separator', name: { en: 'Vacuum breaker valve', fr: 'Casse-vide' }, definition: { en: 'Lets air back into the shell to break the vacuum on shutdown.', fr: 'Laisse entrer l’air dans le corps pour casser le vide à l’arrêt.' }, hint: { en: 'Used during shutdown, not startup.', fr: 'Utilisé à l’arrêt, pas au démarrage.' } },
  { id: 'c28', part: 'evaporator', name: { en: 'Plate gaskets', fr: 'Joints de plaques' }, definition: { en: 'Seals between plates keeping the circuits apart.', fr: 'Joints entre plaques qui séparent les circuits.' }, hint: { en: 'A leak mixes jacket water and seawater.', fr: 'Une fuite mélange eau moteur et eau de mer.' } },
  { id: 'c29', part: 'suctionValve', name: { en: 'Seawater strainer', fr: 'Filtre d’eau de mer' }, definition: { en: 'Stops debris from the sea chest before the pump.', fr: 'Arrête les débris de la prise d’eau avant la pompe.' }, hint: { en: 'A damaged strainer lets foreign bodies reach the ejector.', fr: 'Un filtre endommagé laisse passer des corps étrangers jusqu’à l’éjecteur.' } },
  { id: 'c30', part: 'dischargeValve', name: { en: 'Non-return valve', fr: 'Clapet anti-retour' }, definition: { en: 'Prevents back-flow into the pump when it stops.', fr: 'Empêche le retour d’eau dans la pompe à l’arrêt.' }, hint: { en: 'Fitted on the pump discharge line.', fr: 'Montée sur la ligne de refoulement de la pompe.' } },
  { id: 'c31', part: 'jacketOutlet', name: { en: 'Jacket water thermometer', fr: 'Thermomètre eau moteur' }, definition: { en: 'Shows the jacket water temperature entering/leaving the evaporator.', fr: 'Indique la température de l’eau moteur en entrée/sortie d’évaporateur.' }, hint: { en: 'Used to check the heat supply.', fr: 'Sert à vérifier l’apport de chaleur.' } },
  { id: 'c32', part: 'logbook', name: { en: 'Engine-room logbook', fr: 'Journal machine' }, definition: { en: 'Record of the operating parameters at each startup.', fr: 'Registre des paramètres de fonctionnement à chaque démarrage.' }, hint: { en: 'Filled in at the end of the startup.', fr: 'Renseigné à la fin du démarrage.' } },
]

const catalogueMeta: Record<string, [ComponentType, string, string]> = {
  c01: ['exchanger', 'Central shell of the unit; works under vacuum (normal ≥ 90 %).', 'Corps central de l’appareil ; fonctionne sous vide (normal ≥ 90 %).'],
  c02: ['exchanger', 'Lower plate pack, hot side; jacket water at about 70–80 °C.', 'Paquet de plaques inférieur, côté chaud ; eau moteur à environ 70–80 °C.'],
  c03: ['exchanger', 'Upper plate pack, cold side; cooled by seawater.', 'Paquet de plaques supérieur, côté froid ; refroidi par l’eau de mer.'],
  c04: ['exchanger', 'Mesh fitted between the evaporator and the condenser, in the vapour path.', 'Grille montée entre l’évaporateur et le condenseur, sur le trajet de la vapeur.'],
  c05: ['pump', 'On the right of the shell; driven by seawater at 3.5–4.5 bar.', 'À droite du corps ; entraîné par l’eau de mer à 3,5–4,5 bar.'],
  c06: ['pump', 'Inside the ejector body, behind the inspection cover; bronze, Ø 12 mm.', 'Dans le corps de l’éjecteur, derrière le couvercle de visite ; bronze, Ø 12 mm.'],
  c07: ['other', 'On the ejector body; held by 4 × M12 bolts (25 N·m).', 'Sur le corps de l’éjecteur ; maintenu par 4 boulons M12 (25 N·m).'],
  c08: ['pump', 'Below the ejector, on the seawater line; delivers 3.5–4.5 bar.', 'Sous l’éjecteur, sur la ligne d’eau de mer ; délivre 3,5–4,5 bar.'],
  c09: ['valve', 'On the seawater line, between the sea chest and the ejector pump.', 'Sur la ligne d’eau de mer, entre la prise d’eau et la pompe de l’éjecteur.'],
  c10: ['valve', 'On the seawater line, just downstream of the ejector pump.', 'Sur la ligne d’eau de mer, juste en aval de la pompe de l’éjecteur.'],
  c11: ['valve', 'At the end of the ejector outlet line, at the ship’s side.', 'Au bout de la ligne de sortie de l’éjecteur, au bordé.'],
  c12: ['valve', 'On top of the separator shell.', 'En haut du corps du séparateur.'],
  c13: ['instrument', 'On top of the separator; normal reading ≥ 90 %.', 'En haut du séparateur ; valeur normale ≥ 90 %.'],
  c14: ['valve', 'On the hot-water line, at the evaporator inlet.', 'Sur la ligne d’eau chaude, à l’entrée de l’évaporateur.'],
  c15: ['valve', 'On the hot-water line, at the evaporator outlet.', 'Sur la ligne d’eau chaude, à la sortie de l’évaporateur.'],
  c16: ['valve', 'Between the jacket water inlet and outlet lines.', 'Entre les lignes d’entrée et de sortie d’eau moteur.'],
  c17: ['valve', 'On the feed line, on the right of the separator.', 'Sur la ligne d’alimentation, à droite du séparateur.'],
  c18: ['other', 'In the feed line, downstream of the feed valve.', 'Dans la ligne d’alimentation, en aval de la vanne d’alimentation.'],
  c19: ['other', 'Connected to the feed line, upstream of the evaporator.', 'Raccordé à la ligne d’alimentation, en amont de l’évaporateur.'],
  c20: ['instrument', 'On the lower part of the separator shell; normal level around mid-glass.', 'En partie basse du corps du séparateur ; niveau normal vers le milieu du voyant.'],
  c21: ['instrument', 'Upstream of the ejector; normal reading 3.5–4.5 bar.', 'En amont de l’éjecteur ; valeur normale 3,5–4,5 bar.'],
  c22: ['pump', 'Below the separator, on the fresh water line.', 'Sous le séparateur, sur la ligne d’eau douce.'],
  c23: ['instrument', 'On the fresh water line, towards the storage tanks.', 'Sur la ligne d’eau douce, vers les caisses de stockage.'],
  c24: ['instrument', 'On the fresh water line, downstream of the distillate pump; typical alarm threshold 2 ppm.', 'Sur la ligne d’eau douce, en aval de la pompe de distillat ; seuil d’alarme typique 2 ppm.'],
  c25: ['valve', 'On the fresh water line, next to the salinometer.', 'Sur la ligne d’eau douce, à côté du salinomètre.'],
  c26: ['other', 'On the bulkhead next to the unit, lower deck of the engine room.', 'Sur la cloison à côté de l’appareil, pont inférieur de la salle des machines.'],
  c27: ['valve', 'On top of the separator shell.', 'En haut du corps du séparateur.'],
  c28: ['other', 'Between the plates of the evaporator and of the condenser.', 'Entre les plaques de l’évaporateur et du condenseur.'],
  c29: ['other', 'On the seawater line, upstream of the ejector pump.', 'Sur la ligne d’eau de mer, en amont de la pompe de l’éjecteur.'],
  c30: ['valve', 'On the discharge line of the ejector pump.', 'Sur la ligne de refoulement de la pompe de l’éjecteur.'],
  c31: ['instrument', 'On the jacket water lines of the evaporator; typically 70–80 °C at the inlet.', 'Sur les lignes d’eau moteur de l’évaporateur ; typiquement 70–80 °C à l’entrée.'],
  c32: ['other', 'Kept next to the control panel.', 'Rangé à côté du tableau de commande.'],
}

export const catalogue: Component[] = baseCatalogue.map((c) => {
  const [type, en, fr] = catalogueMeta[c.id]
  return { ...c, type, note: { en, fr } }
})

export const partName = (id: PartId): L => {
  const c = catalogue.find((x) => x.part === id)
  return c?.name ?? { en: id, fr: id }
}

/* --------------------------- Identification ------------------------- */

export type IdQuestion = {
  id: string
  part: PartId
  /** Catalogue component the question is about */
  component?: string
  kind: 'name' | 'function'
  question: L
  options: L[]
  correct: number
  hint: L
  explanation: L
}

/** Small seeded generator — fixed draw for the demo data, `Math.random` for a real attempt. */
export function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function shuffled<T>(arr: T[], rnd: () => number) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const ID_QUESTION_COUNT = 8

/**
 * Identification attempt: 8 DIFFERENT parts drawn from the 32 components, 4 Name + 4 Function
 * questions mixed. A part is asked once only — the Name explanation would give away the
 * Function answer (and vice versa).
 */
export function drawIdentification(rnd: () => number = Math.random): IdQuestion[] {
  const parts = shuffled(Array.from(new Set(catalogue.map((c) => c.part))), rnd).slice(0, ID_QUESTION_COUNT)
  const kinds = shuffled<IdQuestion['kind']>(
    parts.map((_, i) => (i < parts.length / 2 ? 'name' : 'function')),
    rnd,
  )
  return parts.map((part, i) => {
    const same = catalogue.filter((c) => c.part === part)
    const c = same[Math.floor(rnd() * same.length)]
    const kind = kinds[i]
    // Distractors never come from the same machine part (they would also be right)
    const options = shuffled([c, ...shuffled(catalogue.filter((x) => x.part !== part), rnd).slice(0, 3)], rnd)
    return {
      id: `${c.id}-${kind}`,
      part,
      component: c.id,
      kind,
      question:
        kind === 'name'
          ? { en: 'What is the name of the highlighted part?', fr: 'Quel est le nom de la pièce en surbrillance ?' }
          : { en: 'What is the function of the highlighted part?', fr: 'Quelle est la fonction de la pièce en surbrillance ?' },
      options: options.map((o) => (kind === 'name' ? o.name : o.definition)),
      correct: options.indexOf(c),
      hint: c.hint,
      explanation:
        kind === 'name'
          ? { en: `${c.name.en} — ${c.note.en}`, fr: `${c.name.fr} — ${c.note.fr}` }
          : { en: `${c.name.en}: ${c.definition.en}`, fr: `${c.name.fr} : ${c.definition.fr}` },
    }
  })
}

/** Fixed draw used by the demo attempts. */
export const identificationQuestions: IdQuestion[] = drawIdentification(seededRandom(11))

/* --------------------------- Procedures ----------------------------- */

export type ProcStep = {
  id: string
  label: L
  target: PartId
  tool?: ToolId
  why: L
  wrong: L
  hint1: L
  hint2: L
}

export const startupProcedure: ProcStep[] = [
  { id: 's1', target: 'suctionValve', label: { en: 'Open the ejector pump suction valve', fr: 'Ouvrir la vanne d’aspiration de la pompe de l’éjecteur' }, why: { en: 'The pump must be flooded before it starts, otherwise it runs dry.', fr: 'La pompe doit être en charge avant de démarrer, sinon elle tourne à sec.' }, wrong: { en: 'Nothing can start before the pump has water at its inlet.', fr: 'Rien ne peut démarrer avant que la pompe ait de l’eau à l’aspiration.' }, hint1: { en: 'Start where the seawater enters the circuit.', fr: 'Commencez là où l’eau de mer entre dans le circuit.' }, hint2: { en: 'Click the valve between the sea inlet and the ejector pump.', fr: 'Cliquez sur la vanne entre la prise d’eau et la pompe de l’éjecteur.' } },
  { id: 's2', target: 'dischargeValve', label: { en: 'Open the ejector pump discharge valve', fr: 'Ouvrir la vanne de refoulement de la pompe' }, why: { en: 'The pump needs an open outlet towards the ejector.', fr: 'La pompe a besoin d’une sortie ouverte vers l’éjecteur.' }, wrong: { en: 'The pump outlet is still closed.', fr: 'La sortie de la pompe est encore fermée.' }, hint1: { en: 'Follow the water: what comes after the pump?', fr: 'Suivez l’eau : qu’y a-t-il après la pompe ?' }, hint2: { en: 'Click the valve just above the ejector pump.', fr: 'Cliquez sur la vanne juste au-dessus de la pompe.' } },
  { id: 's3', target: 'overboardValve', label: { en: 'Open the overboard discharge valve', fr: 'Ouvrir la vanne de rejet à la mer' }, why: { en: 'The ejector outlet must have a free path overboard, otherwise pressure builds up.', fr: 'La sortie de l’éjecteur doit pouvoir rejeter à la mer, sinon la pression monte.' }, wrong: { en: 'The ejector outlet has nowhere to go yet.', fr: 'La sortie de l’éjecteur n’a pas encore d’issue.' }, hint1: { en: 'Where do brine and gases leave the ship?', fr: 'Par où la saumure et les gaz quittent-ils le navire ?' }, hint2: { en: 'Click the valve at the end of the ejector outlet line.', fr: 'Cliquez sur la vanne au bout de la ligne de sortie de l’éjecteur.' } },
  { id: 's4', target: 'airVent', label: { en: 'Close the air vent screw', fr: 'Fermer le purgeur d’air' }, why: { en: 'With the vent open, air enters and no vacuum can build.', fr: 'Purgeur ouvert, l’air entre et le vide ne peut pas se faire.' }, wrong: { en: 'The shell is still open to the atmosphere.', fr: 'Le corps est encore ouvert à l’atmosphère.' }, hint1: { en: 'The shell must be airtight before building the vacuum.', fr: 'Le corps doit être étanche avant de faire le vide.' }, hint2: { en: 'Click the small screw on top of the separator.', fr: 'Cliquez sur la petite vis en haut du séparateur.' } },
  { id: 's5', target: 'ejectorPump', label: { en: 'Start the ejector pump', fr: 'Démarrer la pompe de l’éjecteur' }, why: { en: 'All lines are ready: the pump can now drive the ejector.', fr: 'Toutes les lignes sont prêtes : la pompe peut entraîner l’éjecteur.' }, wrong: { en: 'This is not the next action of the sequence.', fr: 'Ce n’est pas l’action suivante de la séquence.' }, hint1: { en: 'Valves are lined up — what creates the flow?', fr: 'Les vannes sont alignées — qu’est-ce qui crée le débit ?' }, hint2: { en: 'Click the ejector pump.', fr: 'Cliquez sur la pompe de l’éjecteur.' } },
  { id: 's6', target: 'vacuumGauge', label: { en: 'Check the vacuum reaches 90 % within 15 s', fr: 'Vérifier que le vide atteint 90 % en 15 s' }, why: { en: 'Boiling at low temperature needs a deep vacuum; a slow rise reveals a leak.', fr: 'L’ébullition à basse température exige un vide poussé ; une montée lente révèle une fuite.' }, wrong: { en: 'Do not add heat before the vacuum is confirmed.', fr: 'N’apportez pas de chaleur avant d’avoir confirmé le vide.' }, hint1: { en: 'Check an instrument before going further.', fr: 'Contrôlez un instrument avant d’aller plus loin.' }, hint2: { en: 'Click the vacuum gauge on top of the separator.', fr: 'Cliquez sur le vacuomètre en haut du séparateur.' } },
  { id: 's7', target: 'jacketInlet', label: { en: 'Open the jacket water inlet valve', fr: 'Ouvrir la vanne d’entrée d’eau moteur' }, why: { en: 'Heat is supplied only once the vacuum is established.', fr: 'La chaleur n’est apportée qu’une fois le vide établi.' }, wrong: { en: 'Heat must come before feeding seawater.', fr: 'La chaleur doit arriver avant l’eau d’alimentation.' }, hint1: { en: 'The evaporator now needs heat.', fr: 'L’évaporateur a maintenant besoin de chaleur.' }, hint2: { en: 'Click the hot-water inlet valve on the left of the evaporator.', fr: 'Cliquez sur la vanne d’entrée d’eau chaude à gauche de l’évaporateur.' } },
  { id: 's8', target: 'seawaterFeed', label: { en: 'Open the seawater feed valve', fr: 'Ouvrir la vanne d’alimentation en eau de mer' }, why: { en: 'Feed water is admitted onto the heated plates and starts evaporating.', fr: 'L’eau d’alimentation arrive sur les plaques chaudes et commence à s’évaporer.' }, wrong: { en: 'The evaporator has nothing to evaporate yet.', fr: 'L’évaporateur n’a encore rien à évaporer.' }, hint1: { en: 'Heat is on — what should be evaporated?', fr: 'La chaleur est là — que faut-il évaporer ?' }, hint2: { en: 'Click the feed valve on the right of the separator.', fr: 'Cliquez sur la vanne d’alimentation à droite du séparateur.' } },
  { id: 's9', target: 'freshwaterPump', label: { en: 'Start the fresh water pump', fr: 'Démarrer la pompe d’eau douce' }, why: { en: 'Condensed water is collected and sent to the tanks.', fr: 'L’eau condensée est recueillie et envoyée vers les caisses.' }, wrong: { en: 'Production is running; the distillate must now be extracted.', fr: 'La production démarre ; il faut maintenant extraire le distillat.' }, hint1: { en: 'Fresh water accumulates under the condenser.', fr: 'L’eau douce s’accumule sous le condenseur.' }, hint2: { en: 'Click the pump below the separator.', fr: 'Cliquez sur la pompe sous le séparateur.' } },
  { id: 's10', target: 'salinometer', label: { en: 'Check salinity on the salinometer', fr: 'Contrôler la salinité au salinomètre' }, why: { en: 'Water above the salinity limit is automatically dumped.', fr: 'L’eau au-dessus du seuil de salinité est rejetée automatiquement.' }, wrong: { en: 'The water quality has not been checked.', fr: 'La qualité de l’eau n’a pas été contrôlée.' }, hint1: { en: 'Is the produced water drinkable?', fr: 'L’eau produite est-elle potable ?' }, hint2: { en: 'Click the salinometer on the fresh water line.', fr: 'Cliquez sur le salinomètre de la ligne d’eau douce.' } },
  { id: 's11', target: 'flowmeter', label: { en: 'Stabilise the product flow', fr: 'Stabiliser le débit produit' }, why: { en: 'A stable flow confirms balanced evaporation.', fr: 'Un débit stable confirme une évaporation équilibrée.' }, wrong: { en: 'The production rate has not been checked.', fr: 'Le débit de production n’a pas été vérifié.' }, hint1: { en: 'How much water is produced?', fr: 'Combien d’eau est produite ?' }, hint2: { en: 'Click the flowmeter on the fresh water line.', fr: 'Cliquez sur le débitmètre de la ligne d’eau douce.' } },
  { id: 's12', target: 'controlPanel', label: { en: 'Confirm the instruments on the control panel', fr: 'Confirmer les instruments au tableau de commande' }, why: { en: 'A last look at all alarms and readings before leaving the unit running.', fr: 'Un dernier contrôle des alarmes et mesures avant de laisser l’appareil en marche.' }, wrong: { en: 'The overall status has not been confirmed.', fr: 'L’état général n’a pas été confirmé.' }, hint1: { en: 'Where are all alarms grouped?', fr: 'Où sont regroupées toutes les alarmes ?' }, hint2: { en: 'Click the control panel.', fr: 'Cliquez sur le tableau de commande.' } },
  { id: 's13', target: 'logbook', label: { en: 'Log the startup parameters', fr: 'Consigner les paramètres de démarrage' }, why: { en: 'Readings are recorded for follow-up and troubleshooting.', fr: 'Les relevés sont consignés pour le suivi et le diagnostic.' }, wrong: { en: 'The readings have not been recorded.', fr: 'Les relevés n’ont pas été consignés.' }, hint1: { en: 'The last step is administrative.', fr: 'La dernière étape est administrative.' }, hint2: { en: 'Click the logbook next to the control panel.', fr: 'Cliquez sur le journal à côté du tableau.' } },
]

export type ToolId = 'inspect' | 'hand' | 'flashlight' | 'padlock' | 'wrench' | 'screwdriver' | 'torqueWrench' | 'pliers'

/** `use` = one line "when to use" shown in the toolbox tooltip. */
export const tools: { id: ToolId; name: L; use: L }[] = [
  { id: 'inspect', name: { en: 'Visual check', fr: 'Contrôle visuel' }, use: { en: 'Read an instrument or observe a part without touching it.', fr: 'Lire un instrument ou observer une pièce sans y toucher.' } },
  { id: 'hand', name: { en: 'Hand', fr: 'Main' }, use: { en: 'Operate a valve, a switch or a pump by hand.', fr: 'Manœuvrer une vanne, un interrupteur ou une pompe à la main.' } },
  { id: 'flashlight', name: { en: 'Flashlight', fr: 'Lampe torche' }, use: { en: 'Light up a dark area to see inside.', fr: 'Éclairer une zone sombre pour voir à l’intérieur.' } },
  { id: 'padlock', name: { en: 'Lockout padlock', fr: 'Cadenas de consignation' }, use: { en: 'Lock out and tag a piece of equipment before working on it.', fr: 'Consigner et étiqueter un équipement avant d’intervenir.' } },
  { id: 'wrench', name: { en: 'Open-end spanner', fr: 'Clé plate' }, use: { en: 'Loosen or tighten bolts and nuts.', fr: 'Desserrer ou serrer des boulons et des écrous.' } },
  { id: 'screwdriver', name: { en: 'Screwdriver', fr: 'Tournevis' }, use: { en: 'Loosen or tighten screws.', fr: 'Desserrer ou serrer des vis.' } },
  { id: 'torqueWrench', name: { en: 'Torque wrench', fr: 'Clé dynamométrique' }, use: { en: 'Tighten bolts to a specified torque.', fr: 'Serrer des boulons à un couple prescrit.' } },
  { id: 'pliers', name: { en: 'Extraction pliers', fr: 'Pince d’extraction' }, use: { en: 'Grip and pull out a small object.', fr: 'Saisir et extraire un petit objet.' } },
]

/** Briefing shown when the alarm trips: symptoms only — the cause is for the student to find. */
export const repairScenario: L = {
  en: 'High brine level alarm. The fresh water flow is dropping and the vacuum is degrading. Diagnose the cause, then intervene.',
  fr: 'Alarme niveau de saumure haut. Le débit d’eau douce baisse et le vide se dégrade. Diagnostiquez la cause puis intervenez.',
}

/** Delay before the alarm trips: the exercise starts in normal operation (longer in VR). */
export const REPAIR_ALARM_DELAY_MS = { Web: 3000, VR: 5000 }

/** Explicit diagnosis, validated after the observation steps and before the repair steps. */
export const repairDiagnosis = {
  afterStep: 2,
  question: { en: 'Diagnosis: what is the most probable cause?', fr: 'Diagnostic : quelle est la cause la plus probable ?' } as L,
  options: [
    {
      id: 'nozzle', correct: true,
      label: { en: 'Blocked ejector nozzle', fr: 'Buse de l’éjecteur obstruée' },
      feedback: { en: 'High driving pressure, rising brine level and falling vacuum: the ejector no longer extracts — its nozzle is obstructed.', fr: 'Pression motrice haute, saumure qui monte et vide qui baisse : l’éjecteur n’extrait plus — sa buse est obstruée.' },
    },
    {
      id: 'pump', correct: false,
      label: { en: 'Ejector pump failure', fr: 'Panne de la pompe de l’éjecteur' },
      feedback: { en: 'A failed pump would give a LOW driving pressure — here it is above the normal range.', fr: 'Une pompe en panne donnerait une pression motrice BASSE — ici elle dépasse la plage normale.' },
    },
    {
      id: 'air', correct: false,
      label: { en: 'Air leak into the shell', fr: 'Entrée d’air dans le corps' },
      feedback: { en: 'An air leak degrades the vacuum, but it does not push the driving pressure above its range.', fr: 'Une entrée d’air dégrade le vide, mais ne fait pas monter la pression motrice au-dessus de sa plage.' },
    },
    {
      id: 'jacket', correct: false,
      label: { en: 'Low jacket-water flow', fr: 'Débit d’eau moteur insuffisant' },
      feedback: { en: 'Less heat means less production, but the brine would still be extracted.', fr: 'Moins de chaleur réduit la production, mais la saumure resterait extraite.' },
    },
  ] as { id: string; correct: boolean; label: L; feedback: L }[],
}

/**
 * Instrument readings shown with the "Visual check" tool — consistent with the technical
 * sheet (driving pressure 3.5–4.5 bar, vacuum ≥ 90 %).
 */
export type PlantState = 'normal' | 'fault' | 'stopped'
export const instrumentReadings: Partial<Record<PartId, { label: L } & Record<PlantState, L>>> = {
  vacuumGauge: { label: { en: 'Vacuum', fr: 'Vide' }, normal: { en: '93 %', fr: '93 %' }, fault: { en: '71 %', fr: '71 %' }, stopped: { en: '0 %', fr: '0 %' } },
  ejectorGauge: { label: { en: 'Driving pressure', fr: 'Pression motrice' }, normal: { en: '4.0 bar', fr: '4,0 bar' }, fault: { en: '5.6 bar', fr: '5,6 bar' }, stopped: { en: '0 bar', fr: '0 bar' } },
  brineGauge: { label: { en: 'Brine level', fr: 'Niveau de saumure' }, normal: { en: '45 %', fr: '45 %' }, fault: { en: '88 %', fr: '88 %' }, stopped: { en: '88 %', fr: '88 %' } },
  flowmeter: { label: { en: 'Fresh water flow', fr: 'Débit d’eau douce' }, normal: { en: '0.85 m³/h', fr: '0,85 m³/h' }, fault: { en: '0.30 m³/h', fr: '0,30 m³/h' }, stopped: { en: '0 m³/h', fr: '0 m³/h' } },
  salinometer: { label: { en: 'Salinity', fr: 'Salinité' }, normal: { en: '1.5 ppm', fr: '1,5 ppm' }, fault: { en: '4.8 ppm', fr: '4,8 ppm' }, stopped: { en: '— ppm', fr: '— ppm' } },
}

export const repairProcedure: ProcStep[] = [
  { id: 'r1', target: 'brineGauge', tool: 'inspect', label: { en: 'Notice the rising brine level', fr: 'Constater la montée du niveau de saumure' }, why: { en: 'A rising brine level means brine is no longer extracted.', fr: 'Un niveau qui monte signifie que la saumure n’est plus extraite.' }, wrong: { en: 'Start by observing the symptom.', fr: 'Commencez par observer le symptôme.' }, hint1: { en: 'What does the alarm talk about?', fr: 'De quoi parle l’alarme ?' }, hint2: { en: 'Use the visual check on the brine level sight glass of the separator.', fr: 'Utilisez le contrôle visuel sur le voyant de niveau de saumure du séparateur.' } },
  { id: 'r2', target: 'ejectorGauge', tool: 'inspect', label: { en: 'Read the driving pressure upstream of the ejector', fr: 'Relever la pression motrice en amont de l’éjecteur' }, why: { en: 'The driving pressure is above its normal range (3.5–4.5 bar) while the brine level rises.', fr: 'La pression motrice dépasse sa plage normale (3,5–4,5 bar) alors que le niveau de saumure monte.' }, wrong: { en: 'Take a second reading before concluding.', fr: 'Relevez une seconde mesure avant de conclure.' }, hint1: { en: 'Another instrument sits close to the ejector.', fr: 'Un autre instrument se trouve près de l’éjecteur.' }, hint2: { en: 'Use the visual check on the ejector pressure gauge.', fr: 'Utilisez le contrôle visuel sur le manomètre de l’éjecteur.' } },
  { id: 'r3', target: 'controlPanel', tool: 'hand', label: { en: 'Stop the installation from the control panel', fr: 'Arrêter l’installation au tableau de commande' }, why: { en: 'Never work on a running installation.', fr: 'Jamais d’intervention sur une installation en marche.' }, wrong: { en: 'The installation is still running.', fr: 'L’installation est encore en marche.' }, hint1: { en: 'Safety first: stop everything.', fr: 'La sécurité d’abord : tout arrêter.' }, hint2: { en: 'Use your hand on the control panel.', fr: 'Utilisez la main sur le tableau de commande.' } },
  { id: 'r4', target: 'ejectorPump', tool: 'padlock', label: { en: 'Lock out and tag out the ejector pump', fr: 'Consigner et étiqueter la pompe de l’éjecteur' }, why: { en: 'Lockout prevents anyone restarting the pump during the work.', fr: 'La consignation empêche quiconque de redémarrer la pompe pendant l’intervention.' }, wrong: { en: 'The pump could still be restarted by someone else.', fr: 'La pompe pourrait encore être redémarrée par quelqu’un.' }, hint1: { en: 'Make the stop permanent until you are done.', fr: 'Rendez l’arrêt définitif jusqu’à la fin.' }, hint2: { en: 'Use the lockout padlock on the ejector pump.', fr: 'Utilisez le cadenas de consignation sur la pompe.' } },
  { id: 'r5', target: 'dischargeValve', tool: 'hand', label: { en: 'Close the pump valves and drain the ejector circuit', fr: 'Fermer les vannes de la pompe et vidanger le circuit' }, why: { en: 'Opening a pressurised, full circuit floods the work area.', fr: 'Ouvrir un circuit plein et sous pression inonde la zone.' }, wrong: { en: 'The circuit is still full of seawater.', fr: 'Le circuit est encore plein d’eau de mer.' }, hint1: { en: 'Isolate and empty before opening.', fr: 'Isoler et vider avant d’ouvrir.' }, hint2: { en: 'Use your hand on the pump discharge valve.', fr: 'Utilisez la main sur la vanne de refoulement.' } },
  { id: 'r6', target: 'ejector', tool: 'wrench', label: { en: 'Unbolt and open the ejector inspection cover', fr: 'Déboulonner et ouvrir le couvercle de visite de l’éjecteur' }, why: { en: 'The cover gives access to the nozzle.', fr: 'Le couvercle donne accès à la buse.' }, wrong: { en: 'The nozzle is not accessible yet.', fr: 'La buse n’est pas encore accessible.' }, hint1: { en: 'The cover is bolted.', fr: 'Le couvercle est boulonné.' }, hint2: { en: 'Use the open-end spanner on the ejector.', fr: 'Utilisez la clé plate sur l’éjecteur.' } },
  { id: 'r7', target: 'ejector', tool: 'flashlight', label: { en: 'Locate the foreign body in the nozzle', fr: 'Localiser le corps étranger dans la buse' }, why: { en: 'The inside of the nozzle is dark — locate the debris before extracting it.', fr: 'L’intérieur de la buse est sombre — localisez le débris avant de l’extraire.' }, wrong: { en: 'You have not located the obstruction yet.', fr: 'Vous n’avez pas encore localisé l’obstruction.' }, hint1: { en: 'You need to see inside.', fr: 'Il faut voir à l’intérieur.' }, hint2: { en: 'Use the flashlight on the ejector.', fr: 'Utilisez la lampe torche sur l’éjecteur.' } },
  { id: 'r8', target: 'ejector', tool: 'pliers', label: { en: 'Extract the foreign body from the nozzle', fr: 'Extraire le corps étranger de la buse' }, why: { en: 'Removing the debris restores the ejector suction.', fr: 'Retirer le débris rétablit l’aspiration de l’éjecteur.' }, wrong: { en: 'The debris is still in the nozzle.', fr: 'Le débris est toujours dans la buse.' }, hint1: { en: 'Grab the debris without damaging the nozzle.', fr: 'Saisissez le débris sans abîmer la buse.' }, hint2: { en: 'Use the extraction pliers on the ejector.', fr: 'Utilisez la pince d’extraction sur l’éjecteur.' } },
  { id: 'r9', target: 'ejector', tool: 'torqueWrench', label: { en: 'Refit the cover and torque the bolts to 25 N·m', fr: 'Remonter le couvercle et serrer les boulons à 25 N·m' }, why: { en: 'Correct torque guarantees tightness without damaging the gasket.', fr: 'Le bon couple garantit l’étanchéité sans écraser le joint.' }, wrong: { en: 'The cover is not closed to specification.', fr: 'Le couvercle n’est pas refermé selon la spécification.' }, hint1: { en: 'Close the cover to the specified torque.', fr: 'Refermez au couple prescrit.' }, hint2: { en: 'Use the torque wrench on the ejector (see reference sheet).', fr: 'Utilisez la clé dynamométrique sur l’éjecteur (voir fiche technique).' } },
  { id: 'r10', target: 'ejectorPump', tool: 'padlock', label: { en: 'Remove the lockout, restart and check vacuum & brine level', fr: 'Déconsigner, redémarrer et vérifier vide et niveau' }, why: { en: 'Only the person who locked out removes the lock, then the unit is restarted and checked.', fr: 'Seul celui qui a consigné retire le cadenas, puis l’appareil est redémarré et contrôlé.' }, wrong: { en: 'The pump is still locked out.', fr: 'La pompe est toujours consignée.' }, hint1: { en: 'Undo the safety measure you applied.', fr: 'Retirez la mesure de sécurité appliquée.' }, hint2: { en: 'Use the lockout padlock on the ejector pump.', fr: 'Utilisez le cadenas de consignation sur la pompe.' } },
]

export const referenceSheet = {
  title: { en: 'Combined ejector — technical sheet', fr: 'Éjecteur combiné — fiche technique' },
  draft: { en: 'Draft — final content to be supplied by COMIM.', fr: 'Brouillon — contenu final fourni par COMIM.' },
  rows: [
    [{ en: 'Driving water pressure', fr: 'Pression eau motrice' }, { en: '3.5 – 4.5 bar', fr: '3,5 – 4,5 bar' }],
    [{ en: 'Vacuum (normal)', fr: 'Vide (normal)' }, { en: '≥ 90 % (−0.9 bar)', fr: '≥ 90 % (−0,9 bar)' }],
    [{ en: 'Inspection cover bolts', fr: 'Boulons du couvercle' }, { en: '4 × M12 — 25 N·m, cross pattern', fr: '4 × M12 — 25 N·m, serrage en croix' }],
    [{ en: 'Nozzle', fr: 'Buse' }, { en: 'Bronze, Ø 12 mm — do not scratch', fr: 'Bronze, Ø 12 mm — ne pas rayer' }],
    [{ en: 'Lockout points', fr: 'Points de consignation' }, { en: 'Ejector pump breaker (MCC panel 3) + suction & discharge valves', fr: 'Disjoncteur pompe éjecteur (tableau MCC 3) + vannes aspiration et refoulement' }],
    [{ en: 'Gasket', fr: 'Joint' }, { en: 'Replace if damaged on reassembly', fr: 'Remplacer s’il est abîmé au remontage' }],
  ] as [L, L][],
}

/* ---------------------------- Guided tour --------------------------- */

export type TourSegment = { focus: PartId[]; exploded: boolean; title: L; text: L }

export const tourSegments: TourSegment[] = [
  { focus: [], exploded: false, title: { en: 'Welcome', fr: 'Bienvenue' }, text: { en: 'Welcome aboard. This freshwater generator produces drinking water from seawater, using the heat of the main engine cooling water. Let us take it apart, piece by piece.', fr: 'Bienvenue à bord. Ce générateur d’eau douce produit de l’eau potable à partir de l’eau de mer, grâce à la chaleur de l’eau de refroidissement du moteur principal. Démontons-le pièce par pièce.' } },
  { focus: ['separator'], exploded: true, title: { en: 'Separator vessel', fr: 'Le séparateur' }, text: { en: 'The separator vessel is the largest volume. Inside, under vacuum, seawater boils at only about fifty degrees.', fr: 'Le séparateur est le plus grand volume. À l’intérieur, sous vide, l’eau de mer bout à environ cinquante degrés seulement.' } },
  { focus: ['evaporator'], exploded: true, title: { en: 'Evaporator', fr: 'L’évaporateur' }, text: { en: 'At the bottom, the evaporator plates are heated by the engine jacket water. The seawater fed between them turns into vapour.', fr: 'En bas, les plaques de l’évaporateur sont chauffées par l’eau moteur. L’eau de mer qui circule entre elles se transforme en vapeur.' } },
  { focus: ['demister'], exploded: true, title: { en: 'Demister', fr: 'Le dévésiculeur' }, text: { en: 'The vapour rises through the demister, a mesh that stops salty droplets.', fr: 'La vapeur monte à travers le dévésiculeur, une grille qui arrête les gouttelettes salées.' } },
  { focus: ['condenser'], exploded: true, title: { en: 'Condenser', fr: 'Le condenseur' }, text: { en: 'At the top, the condenser plates are cooled by seawater. The vapour condenses: this is our fresh water.', fr: 'En haut, les plaques du condenseur sont refroidies par l’eau de mer. La vapeur se condense : c’est notre eau douce.' } },
  { focus: ['ejector', 'ejectorPump'], exploded: true, title: { en: 'Ejector and its pump', fr: 'L’éjecteur et sa pompe' }, text: { en: 'The ejector pump drives seawater through the combined ejector. It extracts brine and gases, and keeps the vacuum.', fr: 'La pompe de l’éjecteur envoie l’eau de mer dans l’éjecteur combiné. Il extrait la saumure et les gaz, et maintient le vide.' } },
  { focus: ['salinometer', 'dumpValve'], exploded: true, title: { en: 'Salinometer', fr: 'Le salinomètre' }, text: { en: 'The salinometer checks the salt content. If the water is too salty, the dump valve sends it away automatically.', fr: 'Le salinomètre contrôle la teneur en sel. Si l’eau est trop salée, l’électrovanne la rejette automatiquement.' } },
  { focus: ['freshwaterPump', 'flowmeter'], exploded: true, title: { en: 'Fresh water pump', fr: 'La pompe d’eau douce' }, text: { en: 'The fresh water pump sends the distillate to the tanks, through the flowmeter that measures production.', fr: 'La pompe d’eau douce envoie le distillat vers les caisses, via le débitmètre qui mesure la production.' } },
  { focus: ['controlPanel'], exploded: false, title: { en: 'Reassembly', fr: 'Remontage' }, text: { en: 'Everything goes back together. The unit is operated from the control panel. You are now ready for the exercises.', fr: 'Tout se remonte. L’appareil se pilote depuis le tableau de commande. Vous êtes prêt pour les exercices.' } },
]

/* --------------------------- Final quiz bank ------------------------ */

export type Topic = 'Safety' | 'Procedure' | 'Components'

export type QuizQuestion = {
  id: string
  topic: Topic
  multi: boolean
  q: L
  options: L[]
  correct: number[]
  explanation: L
  media?: { kind: 'part'; part: PartId } | { kind: 'image'; dataUrl: string; name: string }
  /** 'COMIM' = default bank (provided, not editable) · 'School' = written by the school */
  source: 'COMIM' | 'School'
  /** School questions: only the author may edit */
  authorId?: string
  authorName?: string
  authorRole?: 'teacher' | 'admin'
}

const q = (
  id: string,
  topic: Topic,
  qText: L,
  options: L[],
  correct: number[],
  explanation: L,
  part?: PartId,
): QuizQuestion => ({
  id,
  topic,
  multi: correct.length > 1,
  q: qText,
  options,
  correct,
  explanation,
  media: part ? { kind: 'part', part } : undefined,
  source: 'COMIM',
})

const yn = (a: L, b: L, c: L, d: L) => [a, b, c, d]

export const comimQuestionBank: QuizQuestion[] = [
  // ---- Safety (10)
  q('fq01', 'Safety', { en: 'What must be done before opening the ejector cover?', fr: 'Que faut-il faire avant d’ouvrir le couvercle de l’éjecteur ?' }, yn({ en: 'Lock out and tag out the pump', fr: 'Consigner et étiqueter la pompe' }, { en: 'Drain the ejector circuit', fr: 'Vidanger le circuit de l’éjecteur' }, { en: 'Cut the ship’s main power', fr: 'Couper l’alimentation générale du navire' }, { en: 'Wait for the end of the watch', fr: 'Attendre la fin du quart' }), [0, 1], { en: 'Lockout prevents a restart and draining avoids flooding.', fr: 'La consignation empêche un redémarrage et la vidange évite l’inondation.' }, 'ejector'),
  q('fq02', 'Safety', { en: 'Who may remove a lockout padlock?', fr: 'Qui peut retirer un cadenas de consignation ?' }, yn({ en: 'Any crew member', fr: 'N’importe quel membre d’équipage' }, { en: 'The person who applied it', fr: 'La personne qui l’a posé' }, { en: 'The cook', fr: 'Le cuisinier' }, { en: 'Nobody, ever', fr: 'Personne, jamais' }), [1], { en: 'Only the person who locked out removes the lock.', fr: 'Seule la personne qui a consigné retire le cadenas.' }),
  q('fq03', 'Safety', { en: 'Which PPE is required to work on the ejector?', fr: 'Quels EPI faut-il pour intervenir sur l’éjecteur ?' }, yn({ en: 'Safety glasses', fr: 'Lunettes de protection' }, { en: 'Gloves', fr: 'Gants' }, { en: 'Life jacket', fr: 'Gilet de sauvetage' }, { en: 'Welding mask', fr: 'Masque de soudeur' }), [0, 1], { en: 'Seawater splashes and sharp edges: glasses and gloves.', fr: 'Projections d’eau de mer et arêtes vives : lunettes et gants.' }, 'ejector'),
  q('fq04', 'Safety', { en: 'Why stop the installation before any intervention?', fr: 'Pourquoi arrêter l’installation avant toute intervention ?' }, yn({ en: 'To save energy', fr: 'Pour économiser l’énergie' }, { en: 'To avoid moving parts and pressure', fr: 'Pour éviter les pièces en mouvement et la pression' }, { en: 'Because it is noisy', fr: 'Parce que c’est bruyant' }, { en: 'It is not required', fr: 'Ce n’est pas nécessaire' }), [1], { en: 'Rotating pumps and pressurised lines are the main hazards.', fr: 'Pompes en rotation et lignes sous pression sont les principaux dangers.' }, 'controlPanel'),
  q('fq05', 'Safety', { en: 'Water above the salinity limit must be…', fr: 'Une eau au-dessus du seuil de salinité doit être…' }, yn({ en: 'Sent to the drinking water tank', fr: 'Envoyée vers la caisse d’eau potable' }, { en: 'Dumped automatically', fr: 'Rejetée automatiquement' }, { en: 'Boiled again by hand', fr: 'Rebouillie à la main' }, { en: 'Mixed with tap water', fr: 'Mélangée à l’eau du robinet' }), [1], { en: 'The salinometer opens the dump valve to protect the tanks.', fr: 'Le salinomètre ouvre l’électrovanne pour protéger les caisses.' }, 'salinometer'),
  q('fq06', 'Safety', { en: 'Opening a full, pressurised circuit can cause…', fr: 'Ouvrir un circuit plein et sous pression peut provoquer…' }, yn({ en: 'Flooding and injury', fr: 'Une inondation et des blessures' }, { en: 'A better vacuum', fr: 'Un meilleur vide' }, { en: 'Lower salinity', fr: 'Une salinité plus basse' }, { en: 'Nothing', fr: 'Rien' }), [0], { en: 'Always isolate and drain first.', fr: 'Toujours isoler et vidanger d’abord.' }),
  q('fq07', 'Safety', { en: 'What must a lockout tag show?', fr: 'Que doit indiquer l’étiquette de consignation ?' }, yn({ en: 'Name of the person', fr: 'Le nom de la personne' }, { en: 'Date and reason', fr: 'La date et le motif' }, { en: 'The ship’s speed', fr: 'La vitesse du navire' }, { en: 'Nothing', fr: 'Rien' }), [0, 1], { en: 'The tag identifies who locked out, when and why.', fr: 'L’étiquette identifie qui a consigné, quand et pourquoi.' }),
  q('fq08', 'Safety', { en: 'Before restarting after a repair you must…', fr: 'Avant de redémarrer après une réparation, il faut…' }, yn({ en: 'Check that nobody is working on the unit', fr: 'Vérifier que personne n’intervient sur l’appareil' }, { en: 'Remove tools from the area', fr: 'Retirer les outils de la zone' }, { en: 'Open the air vent', fr: 'Ouvrir le purgeur d’air' }, { en: 'Skip the checks', fr: 'Sauter les contrôles' }), [0, 1], { en: 'A safe restart means a clear area and nobody exposed.', fr: 'Redémarrer en sécurité : zone dégagée et personne exposé.' }),
  q('fq09', 'Safety', { en: 'A damaged seawater strainer can lead to…', fr: 'Un filtre d’eau de mer endommagé peut entraîner…' }, yn({ en: 'Foreign bodies blocking the ejector', fr: 'Des corps étrangers bloquant l’éjecteur' }, { en: 'Higher production', fr: 'Une production plus élevée' }, { en: 'Lower jacket temperature', fr: 'Une eau moteur plus froide' }, { en: 'Nothing', fr: 'Rien' }), [0], { en: 'Debris reaching the nozzle is the fault studied in Exercise 3.', fr: 'Un débris atteignant la buse est la panne étudiée à l’exercice 3.' }, 'suctionValve'),
  q('fq10', 'Safety', { en: 'Which torque applies to the ejector cover bolts?', fr: 'Quel couple pour les boulons du couvercle de l’éjecteur ?' }, yn({ en: '5 N·m', fr: '5 N·m' }, { en: '25 N·m', fr: '25 N·m' }, { en: '250 N·m', fr: '250 N·m' }, { en: 'As tight as possible', fr: 'Le plus fort possible' }), [1], { en: 'See the reference sheet: 25 N·m in a cross pattern.', fr: 'Voir la fiche technique : 25 N·m en croix.' }, 'ejector'),
  // ---- Procedure (10)
  q('fq11', 'Procedure', { en: 'Which valve is opened first during startup?', fr: 'Quelle vanne ouvre-t-on en premier au démarrage ?' }, yn({ en: 'Jacket water inlet', fr: 'Entrée eau moteur' }, { en: 'Pump suction valve', fr: 'Vanne d’aspiration de la pompe' }, { en: 'Seawater feed', fr: 'Alimentation eau de mer' }, { en: 'Air vent', fr: 'Purgeur d’air' }), [1], { en: 'The pump must be flooded first.', fr: 'La pompe doit d’abord être en charge.' }, 'suctionValve'),
  q('fq12', 'Procedure', { en: 'What vacuum must be reached before heating?', fr: 'Quel vide faut-il atteindre avant de chauffer ?' }, yn({ en: '50 %', fr: '50 %' }, { en: '70 %', fr: '70 %' }, { en: '90 % within ~15 s', fr: '90 % en ~15 s' }, { en: 'None', fr: 'Aucun' }), [2], { en: 'A deep vacuum lowers the boiling point.', fr: 'Un vide poussé abaisse le point d’ébullition.' }, 'vacuumGauge'),
  q('fq13', 'Procedure', { en: 'In what order are the pump valves opened?', fr: 'Dans quel ordre ouvre-t-on les vannes de la pompe ?' }, yn({ en: 'Discharge then suction', fr: 'Refoulement puis aspiration' }, { en: 'Suction then discharge', fr: 'Aspiration puis refoulement' }, { en: 'Both at once', fr: 'Les deux à la fois' }, { en: 'Order does not matter', fr: 'L’ordre n’a pas d’importance' }), [1], { en: 'Suction first, then discharge.', fr: 'Aspiration d’abord, puis refoulement.' }, 'dischargeValve'),
  q('fq14', 'Procedure', { en: 'Why close the air vent before starting the pump?', fr: 'Pourquoi fermer le purgeur avant de démarrer la pompe ?' }, yn({ en: 'So the vacuum can build', fr: 'Pour que le vide se fasse' }, { en: 'To cool the shell', fr: 'Pour refroidir le corps' }, { en: 'To increase salinity', fr: 'Pour augmenter la salinité' }, { en: 'It stays open', fr: 'Il reste ouvert' }), [0], { en: 'An open vent lets air in.', fr: 'Un purgeur ouvert laisse entrer l’air.' }, 'airVent'),
  q('fq15', 'Procedure', { en: 'When is the jacket water admitted?', fr: 'Quand admet-on l’eau moteur ?' }, yn({ en: 'Before starting the pump', fr: 'Avant de démarrer la pompe' }, { en: 'Once the vacuum is established', fr: 'Une fois le vide établi' }, { en: 'At the very end', fr: 'Tout à la fin' }, { en: 'Never', fr: 'Jamais' }), [1], { en: 'Heat after vacuum.', fr: 'La chaleur après le vide.' }, 'jacketInlet'),
  q('fq16', 'Procedure', { en: 'What follows the jacket water inlet?', fr: 'Que suit l’ouverture de l’eau moteur ?' }, yn({ en: 'Seawater feed', fr: 'L’alimentation en eau de mer' }, { en: 'Closing the air vent', fr: 'La fermeture du purgeur' }, { en: 'Stopping the pump', fr: 'L’arrêt de la pompe' }, { en: 'Logging', fr: 'La consignation des relevés' }), [0], { en: 'Heated plates now receive feed water.', fr: 'Les plaques chaudes reçoivent l’eau d’alimentation.' }, 'seawaterFeed'),
  q('fq17', 'Procedure', { en: 'Which reading confirms an ejector obstruction?', fr: 'Quelle mesure confirme une obstruction de l’éjecteur ?' }, yn({ en: 'High driving pressure with rising brine', fr: 'Pression motrice haute et saumure qui monte' }, { en: 'Low salinity', fr: 'Salinité basse' }, { en: 'High flow', fr: 'Débit élevé' }, { en: 'Cold jacket water', fr: 'Eau moteur froide' }), [0], { en: 'Both readings together point to the nozzle.', fr: 'Les deux mesures ensemble désignent la buse.' }, 'ejectorGauge'),
  q('fq18', 'Procedure', { en: 'What is the last step of the startup?', fr: 'Quelle est la dernière étape du démarrage ?' }, yn({ en: 'Open the air vent', fr: 'Ouvrir le purgeur' }, { en: 'Log the parameters', fr: 'Consigner les paramètres' }, { en: 'Stop the pump', fr: 'Arrêter la pompe' }, { en: 'Open the cover', fr: 'Ouvrir le couvercle' }), [1], { en: 'Readings are logged for follow-up.', fr: 'Les relevés sont consignés pour le suivi.' }, 'logbook'),
  q('fq19', 'Procedure', { en: 'Which tool locates debris inside the nozzle?', fr: 'Quel outil permet de localiser un débris dans la buse ?' }, yn({ en: 'Torque wrench', fr: 'Clé dynamométrique' }, { en: 'Flashlight', fr: 'Lampe torche' }, { en: 'Screwdriver', fr: 'Tournevis' }, { en: 'Padlock', fr: 'Cadenas' }), [1], { en: 'You must see inside before extracting.', fr: 'Il faut voir à l’intérieur avant d’extraire.' }, 'ejector'),
  q('fq20', 'Procedure', { en: 'Before opening the ejector cover, the circuit must be…', fr: 'Avant d’ouvrir le couvercle, le circuit doit être…' }, yn({ en: 'Drained', fr: 'Vidangé' }, { en: 'Pressurised', fr: 'Sous pression' }, { en: 'Heated', fr: 'Chauffé' }, { en: 'Running', fr: 'En marche' }), [0], { en: 'Isolate and drain first.', fr: 'Isoler et vidanger d’abord.' }),
  // ---- Components (12)
  q('fq21', 'Components', { en: 'What is the purpose of the demister?', fr: 'Quel est le rôle du dévésiculeur ?' }, yn({ en: 'Heat seawater', fr: 'Chauffer l’eau de mer' }, { en: 'Retain seawater droplets', fr: 'Retenir les gouttelettes d’eau de mer' }, { en: 'Measure salinity', fr: 'Mesurer la salinité' }, { en: 'Prime the circuit', fr: 'Amorcer le circuit' }), [1], { en: 'It stops salty droplets in the vapour.', fr: 'Il arrête les gouttelettes salées dans la vapeur.' }, 'demister'),
  q('fq22', 'Components', { en: 'Which instrument measures the salt content?', fr: 'Quel instrument mesure la teneur en sel ?' }, yn({ en: 'Pressure gauge', fr: 'Manomètre' }, { en: 'Salinometer', fr: 'Salinomètre' }, { en: 'Thermometer', fr: 'Thermomètre' }, { en: 'Flowmeter', fr: 'Débitmètre' }), [1], { en: 'The salinometer, which also drives the dump valve.', fr: 'Le salinomètre, qui commande aussi l’électrovanne.' }, 'salinometer'),
  q('fq23', 'Components', { en: 'What does the combined ejector do?', fr: 'Que fait l’éjecteur combiné ?' }, yn({ en: 'Heats seawater', fr: 'Il chauffe l’eau de mer' }, { en: 'Extracts brine and gases, maintains the vacuum', fr: 'Il extrait saumure et gaz, et maintient le vide' }, { en: 'Cools the condenser', fr: 'Il refroidit le condenseur' }, { en: 'Measures salinity', fr: 'Il mesure la salinité' }), [1], { en: 'Liquid and gas extraction in one device.', fr: 'Extraction liquide et gaz en un seul appareil.' }, 'ejector'),
  q('fq24', 'Components', { en: 'Which plates are cooled by seawater?', fr: 'Quelles plaques sont refroidies par l’eau de mer ?' }, yn({ en: 'Evaporator plates', fr: 'Plaques de l’évaporateur' }, { en: 'Condenser plates', fr: 'Plaques du condenseur' }, { en: 'Demister', fr: 'Dévésiculeur' }, { en: 'Separator', fr: 'Séparateur' }), [1], { en: 'The condenser is the cold side.', fr: 'Le condenseur est le côté froid.' }, 'condenser'),
  q('fq25', 'Components', { en: 'What heats the evaporator?', fr: 'Qu’est-ce qui chauffe l’évaporateur ?' }, yn({ en: 'Electric heater', fr: 'Une résistance électrique' }, { en: 'Engine jacket water', fr: 'L’eau de refroidissement moteur' }, { en: 'Steam boiler', fr: 'Une chaudière' }, { en: 'Sunlight', fr: 'Le soleil' }), [1], { en: 'Waste heat from the engine.', fr: 'La chaleur perdue du moteur.' }, 'evaporator'),
  q('fq26', 'Components', { en: 'Where does evaporation take place under vacuum?', fr: 'Où se fait l’évaporation sous vide ?' }, yn({ en: 'Separator vessel', fr: 'Dans le séparateur' }, { en: 'Ejector pump', fr: 'Dans la pompe de l’éjecteur' }, { en: 'Control panel', fr: 'Dans le tableau' }, { en: 'Fresh water tank', fr: 'Dans la caisse d’eau douce' }), [0], { en: 'The separator vessel contains the plate packs.', fr: 'Le séparateur contient les blocs de plaques.' }, 'separator'),
  q('fq27', 'Components', { en: 'What does the flowmeter measure?', fr: 'Que mesure le débitmètre ?' }, yn({ en: 'Salinity', fr: 'La salinité' }, { en: 'Fresh water production rate', fr: 'Le débit d’eau douce produite' }, { en: 'Vacuum', fr: 'Le vide' }, { en: 'Temperature', fr: 'La température' }), [1], { en: 'It measures production.', fr: 'Il mesure la production.' }, 'flowmeter'),
  q('fq28', 'Components', { en: 'Which device sends off-spec water away?', fr: 'Quel appareil rejette l’eau hors norme ?' }, yn({ en: 'Solenoid dump valve', fr: 'L’électrovanne de rejet' }, { en: 'Air vent', fr: 'Le purgeur d’air' }, { en: 'Demister', fr: 'Le dévésiculeur' }, { en: 'Strainer', fr: 'Le filtre' }), [0], { en: 'Commanded by the salinometer.', fr: 'Commandée par le salinomètre.' }, 'dumpValve'),
  q('fq29', 'Components', { en: 'What does the brine sight glass show?', fr: 'Qu’indique le voyant de saumure ?' }, yn({ en: 'The brine level in the separator', fr: 'Le niveau de saumure dans le séparateur' }, { en: 'The engine speed', fr: 'Le régime moteur' }, { en: 'The salinity', fr: 'La salinité' }, { en: 'The flow', fr: 'Le débit' }), [0], { en: 'A rising level reveals an extraction fault.', fr: 'Un niveau qui monte révèle un défaut d’extraction.' }, 'brineGauge'),
  q('fq30', 'Components', { en: 'What does the vacuum gauge show?', fr: 'Qu’indique le vacuomètre ?' }, yn({ en: 'The vacuum level in the shell', fr: 'Le niveau de vide dans le corps' }, { en: 'The water temperature', fr: 'La température de l’eau' }, { en: 'The salt content', fr: 'La teneur en sel' }, { en: 'The pump speed', fr: 'La vitesse de la pompe' }), [0], { en: 'It is checked right after the pump start.', fr: 'On le contrôle juste après le démarrage de la pompe.' }, 'vacuumGauge'),
  q('fq31', 'Components', { en: 'What does the ejector pump supply?', fr: 'Qu’alimente la pompe de l’éjecteur ?' }, yn({ en: 'Driving water to the ejector', fr: 'L’eau motrice de l’éjecteur' }, { en: 'Cooling water to the condenser', fr: 'L’eau de refroidissement du condenseur' }, { en: 'Fresh water to the tanks', fr: 'L’eau douce vers les caisses' }, { en: 'Fuel to the engine', fr: 'Le carburant du moteur' }), [0, 1], { en: 'It feeds both the ejector and the condenser.', fr: 'Elle alimente l’éjecteur et le condenseur.' }, 'ejectorPump'),
  q('fq32', 'Components', { en: 'What do the plate gaskets do?', fr: 'À quoi servent les joints de plaques ?' }, yn({ en: 'Keep the circuits apart', fr: 'Séparer les circuits' }, { en: 'Measure flow', fr: 'Mesurer le débit' }, { en: 'Create vacuum', fr: 'Créer le vide' }, { en: 'Filter debris', fr: 'Filtrer les débris' }), [0], { en: 'A leaking gasket mixes jacket water and seawater.', fr: 'Un joint qui fuit mélange eau moteur et eau de mer.' }, 'evaporator'),
]

export const QUIZ_LENGTH = 20
export const MIN_SAFETY = 5
export const PASS_THRESHOLD = 70

/* ---------------------------- Modules ------------------------------- */

export type ModuleId = 'tour' | 'identification' | 'startup' | 'repair' | 'finalQuiz'

export const moduleNames: Record<ModuleId, L> = {
  tour: { en: 'Guided Tour', fr: 'Visite guidée' },
  identification: { en: 'Identification', fr: 'Identification' },
  startup: { en: 'Startup Procedure', fr: 'Procédure de démarrage' },
  repair: { en: 'Repair', fr: 'Réparation' },
  finalQuiz: { en: 'Final Quiz', fr: 'Quiz final' },
}
