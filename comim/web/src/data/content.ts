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

export type Component = { id: string; part: PartId; name: L; definition: L; hint: L }

export const catalogue: Component[] = [
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

export const partName = (id: PartId): L => {
  const c = catalogue.find((x) => x.part === id)
  return c?.name ?? { en: id, fr: id }
}

/* --------------------------- Identification ------------------------- */

export type IdQuestion = {
  id: string
  part: PartId
  kind: 'name' | 'function'
  question: L
  options: L[]
  correct: number
  hint: L
  explanation: L
}

const nm = (id: PartId) => partName(id)

export const identificationQuestions: IdQuestion[] = [
  {
    id: 'id1n', part: 'evaporator', kind: 'name',
    question: { en: 'What is the name of the highlighted part?', fr: 'Quel est le nom de la pièce en surbrillance ?' },
    options: [nm('evaporator'), nm('condenser'), nm('demister'), nm('separator')], correct: 0,
    hint: { en: 'It is on the hot side — fed by the engine jacket water.', fr: 'Elle est côté chaud — alimentée par l’eau de refroidissement moteur.' },
    explanation: { en: 'These are the evaporator plates: jacket water heats them so that seawater boils at low temperature under vacuum.', fr: 'Ce sont les plaques de l’évaporateur : l’eau moteur les chauffe pour que l’eau de mer bouille à basse température sous vide.' },
  },
  {
    id: 'id1f', part: 'evaporator', kind: 'function',
    question: { en: 'What is the function of the highlighted part?', fr: 'Quelle est la fonction de la pièce en surbrillance ?' },
    options: [
      { en: 'Turn seawater into vapour', fr: 'Transformer l’eau de mer en vapeur' },
      { en: 'Turn vapour back into water', fr: 'Retransformer la vapeur en eau' },
      { en: 'Measure salinity', fr: 'Mesurer la salinité' },
      { en: 'Create the vacuum', fr: 'Créer le vide' },
    ], correct: 0,
    hint: { en: 'Think about what heat does to water.', fr: 'Pensez à l’effet de la chaleur sur l’eau.' },
    explanation: { en: 'The evaporator transfers heat from the jacket water to the seawater, which evaporates.', fr: 'L’évaporateur transfère la chaleur de l’eau moteur à l’eau de mer, qui s’évapore.' },
  },
  {
    id: 'id2n', part: 'condenser', kind: 'name',
    question: { en: 'What is the name of the highlighted part?', fr: 'Quel est le nom de la pièce en surbrillance ?' },
    options: [nm('evaporator'), nm('condenser'), nm('ejector'), nm('salinometer')], correct: 1,
    hint: { en: 'Cooled by seawater, at the top of the shell.', fr: 'Refroidie par l’eau de mer, en haut du corps.' },
    explanation: { en: 'These are the condenser plates, cooled by seawater from the ejector pump.', fr: 'Ce sont les plaques du condenseur, refroidies par l’eau de mer de la pompe de l’éjecteur.' },
  },
  {
    id: 'id2f', part: 'condenser', kind: 'function',
    question: { en: 'What is the function of the highlighted part?', fr: 'Quelle est la fonction de la pièce en surbrillance ?' },
    options: [
      { en: 'Heat the seawater', fr: 'Chauffer l’eau de mer' },
      { en: 'Condense the vapour into fresh water', fr: 'Condenser la vapeur en eau douce' },
      { en: 'Retain droplets', fr: 'Retenir les gouttelettes' },
      { en: 'Pump the brine overboard', fr: 'Rejeter la saumure à la mer' },
    ], correct: 1,
    hint: { en: 'The opposite of the evaporator.', fr: 'L’inverse de l’évaporateur.' },
    explanation: { en: 'Cold plates take heat from the vapour, which condenses: this is the fresh water produced.', fr: 'Les plaques froides prennent la chaleur de la vapeur, qui se condense : c’est l’eau douce produite.' },
  },
  {
    id: 'id3n', part: 'demister', kind: 'name',
    question: { en: 'What is the name of the highlighted part?', fr: 'Quel est le nom de la pièce en surbrillance ?' },
    options: [nm('separator'), nm('flowmeter'), nm('demister'), nm('condenser')], correct: 2,
    hint: { en: 'A mesh placed in the vapour path.', fr: 'Une grille placée sur le trajet de la vapeur.' },
    explanation: { en: 'This is the demister, between the evaporator and the condenser.', fr: 'C’est le dévésiculeur, entre l’évaporateur et le condenseur.' },
  },
  {
    id: 'id3f', part: 'demister', kind: 'function',
    question: { en: 'What is the function of the highlighted part?', fr: 'Quelle est la fonction de la pièce en surbrillance ?' },
    options: [
      { en: 'Measure the flow', fr: 'Mesurer le débit' },
      { en: 'Break the vacuum', fr: 'Casser le vide' },
      { en: 'Cool the vapour', fr: 'Refroidir la vapeur' },
      { en: 'Retain seawater droplets', fr: 'Retenir les gouttelettes d’eau de mer' },
    ], correct: 3,
    hint: { en: 'Without it, salt would reach the condenser.', fr: 'Sans elle, du sel atteindrait le condenseur.' },
    explanation: { en: 'The demister stops salty droplets carried by the vapour, keeping salinity low.', fr: 'Le dévésiculeur arrête les gouttelettes salées entraînées par la vapeur et garde une salinité basse.' },
  },
  {
    id: 'id4n', part: 'ejector', kind: 'name',
    question: { en: 'What is the name of the highlighted part?', fr: 'Quel est le nom de la pièce en surbrillance ?' },
    options: [nm('ejectorPump'), nm('ejector'), nm('dumpValve'), nm('overboardValve')], correct: 1,
    hint: { en: 'Two functions at once — liquid and gas extraction.', fr: 'Deux fonctions à la fois — extraction liquide et gaz.' },
    explanation: { en: 'This is the combined brine/air ejector, driven by seawater from the ejector pump.', fr: 'C’est l’éjecteur combiné saumure/air, entraîné par l’eau de mer de la pompe de l’éjecteur.' },
  },
  {
    id: 'id4f', part: 'ejector', kind: 'function',
    question: { en: 'What is the function of the highlighted part?', fr: 'Quelle est la fonction de la pièce en surbrillance ?' },
    options: [
      { en: 'Extract brine and gases, and maintain the vacuum', fr: 'Extraire la saumure et les gaz, et maintenir le vide' },
      { en: 'Measure the salt content', fr: 'Mesurer la teneur en sel' },
      { en: 'Heat the jacket water', fr: 'Chauffer l’eau moteur' },
      { en: 'Feed the evaporator', fr: 'Alimenter l’évaporateur' },
    ], correct: 0,
    hint: { en: 'Its name says “combined”.', fr: 'Son nom dit « combiné ».' },
    explanation: { en: 'The ejector sucks brine and non-condensable gases out of the shell — that is what keeps the vacuum.', fr: 'L’éjecteur aspire la saumure et les gaz incondensables du corps — c’est ce qui maintient le vide.' },
  },
]

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

export type ToolId = 'hand' | 'flashlight' | 'padlock' | 'wrench' | 'screwdriver' | 'torqueWrench' | 'pliers'

export const tools: { id: ToolId; name: L }[] = [
  { id: 'hand', name: { en: 'Hand (inspect / operate)', fr: 'Main (observer / manœuvrer)' } },
  { id: 'flashlight', name: { en: 'Flashlight', fr: 'Lampe torche' } },
  { id: 'padlock', name: { en: 'Lockout padlock & tag', fr: 'Cadenas et étiquette de consignation' } },
  { id: 'wrench', name: { en: 'Open-end spanner', fr: 'Clé plate' } },
  { id: 'screwdriver', name: { en: 'Screwdriver', fr: 'Tournevis' } },
  { id: 'torqueWrench', name: { en: 'Torque wrench', fr: 'Clé dynamométrique' } },
  { id: 'pliers', name: { en: 'Extraction pliers', fr: 'Pince d’extraction' } },
]

/** Fault story: a foreign body (strainer debris) obstructs the ejector nozzle. */
export const repairScenario: L = {
  en: 'Fault: the brine level is rising in the separator. A piece of debris that passed through a damaged strainer is obstructing the ejector nozzle. Locate and extract the foreign body safely.',
  fr: 'Panne : le niveau de saumure monte dans le séparateur. Un débris passé à travers un filtre endommagé obstrue la buse de l’éjecteur. Localisez et extrayez le corps étranger en sécurité.',
}

export const repairProcedure: ProcStep[] = [
  { id: 'r1', target: 'brineGauge', tool: 'hand', label: { en: 'Notice the rising brine level', fr: 'Constater la montée du niveau de saumure' }, why: { en: 'A rising brine level means brine is no longer extracted.', fr: 'Un niveau qui monte signifie que la saumure n’est plus extraite.' }, wrong: { en: 'Start by observing the symptom.', fr: 'Commencez par observer le symptôme.' }, hint1: { en: 'What does the alarm talk about?', fr: 'De quoi parle l’alarme ?' }, hint2: { en: 'Use your hand on the brine level sight glass of the separator.', fr: 'Utilisez la main sur le voyant de niveau de saumure du séparateur.' } },
  { id: 'r2', target: 'ejectorGauge', tool: 'hand', label: { en: 'Compare ejector pressure and brine level: nozzle obstruction', fr: 'Comparer pression éjecteur et niveau : obstruction de la buse' }, why: { en: 'High driving pressure + rising brine = the ejector nozzle is blocked.', fr: 'Pression motrice élevée + saumure qui monte = buse de l’éjecteur obstruée.' }, wrong: { en: 'Confirm the diagnosis before acting.', fr: 'Confirmez le diagnostic avant d’agir.' }, hint1: { en: 'Another reading confirms the diagnosis.', fr: 'Une autre mesure confirme le diagnostic.' }, hint2: { en: 'Use your hand on the ejector pressure gauge.', fr: 'Utilisez la main sur le manomètre de l’éjecteur.' } },
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
  source: 'COMIM' | 'School'
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
