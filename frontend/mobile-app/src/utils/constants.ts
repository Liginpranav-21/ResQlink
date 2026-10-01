export const EMERGENCY_TYPES = [
  { id: 'snake_bite',      label: 'Snake Bite',       icon: '🐍', color: '#10b981', severity: 3, bg: '#064e3b' },
  { id: 'heart_attack',    label: 'Heart Attack',     icon: '❤️', color: '#ef4444', severity: 3, bg: '#450a0a' },
  { id: 'heavy_bleeding',  label: 'Heavy Bleeding',   icon: '🩸', color: '#dc2626', severity: 3, bg: '#450a0a' },
  { id: 'fire',            label: 'Fire',             icon: '🔥', color: '#f97316', severity: 3, bg: '#431407' },
  { id: 'earthquake',      label: 'Earthquake',       icon: '🌍', color: '#854d0e', severity: 3, bg: '#1c0d00' },
  { id: 'flood',           label: 'Flood',            icon: '🌊', color: '#0ea5e9', severity: 2, bg: '#0c1a2e' },
  { id: 'landslide',       label: 'Landslide',        icon: '⛰️', color: '#a16207', severity: 2, bg: '#1c1200' },
  { id: 'animal_attack',   label: 'Animal Attack',    icon: '🐾', color: '#7c3aed', severity: 2, bg: '#1e0a3c' },
  { id: 'fracture',        label: 'Fracture',         icon: '🦴', color: '#64748b', severity: 2, bg: '#0f172a' },
  { id: 'accident',        label: 'Accident',         icon: '🚗', color: '#f59e0b', severity: 2, bg: '#1c1200' },
  { id: 'lost_in_forest',  label: 'Lost in Forest',  icon: '🌲', color: '#16a34a', severity: 1, bg: '#052e16' },
  { id: 'breathing_problem',label:'Breathing Problem',icon: '💨', color: '#06b6d4', severity: 2, bg: '#0a2533' },
] as const;

export const FIRST_AID: Record<string, string[]> = {
  snake_bite:       ['Keep calm and immobilize bitten limb below heart level','Remove watches/rings near bite site','Do NOT suck venom, cut wound, or apply ice','Rush to hospital immediately for antivenom'],
  heart_attack:     ['Seat victim upright or semi-reclined — NOT lying flat','Loosen tight clothing around neck and chest','Give 325mg aspirin if conscious and not allergic','Begin CPR immediately if victim becomes unconscious'],
  heavy_bleeding:   ['Apply firm continuous pressure with clean cloth','Elevate injured area above heart level if possible','Do not remove soaked cloth — add more layers on top','Apply tourniquet 5cm above wound if on a limb'],
  fire:             ['Stop, Drop, and Roll if clothes are on fire','Cool burns with cool (not ice cold) water for 10 min','Do not pop blisters or apply butter/toothpaste','Cover loosely with clean cling film or dressing'],
  flood:            ['Move immediately to highest ground available','Do not enter moving floodwater even if shallow','Avoid touching electrical equipment or wires','Signal rescuers with bright cloth or phone torch'],
  earthquake:       ['Drop to knees, Cover head/neck, Hold On to sturdy object','Stay away from windows, outer walls, and heavy furniture','If outdoors, move away from buildings and power lines','After shaking stops, check for gas leaks and injuries'],
  landslide:        ['Evacuate the area immediately — move perpendicular to slide','If caught, curl into a ball protecting head and vitals','Cover mouth with cloth or shirt to avoid dust inhalation','Once safe, signal rescuers — do not re-enter slide zone'],
  fracture:         ['Do not attempt to straighten or move fractured bone','Immobilize with splint using padded boards or rolled newspaper','Apply ice wrapped in cloth to reduce swelling and pain','Seek immediate medical attention — keep victim still'],
  lost_in_forest:   ['Stay in one place and activate SOS signal immediately','Use whistle (3 blasts = distress), bright clothing, or mirror','Build shelter, stay warm, and conserve phone battery','Follow a stream downhill — it leads to civilization'],
  animal_attack:    ['Back away slowly without turning — do not run','Make yourself appear large, make loud noise','If knocked down, protect neck and vital organs','Apply pressure to bite wounds — seek rabies treatment'],
  breathing_problem:['Sit victim upright and loosen any tight clothing','Use prescribed inhaler if available (asthma)','Encourage slow, deep breaths — keep victim calm','Call emergency services immediately — this is critical'],
  accident:         ['Do not move victim unless in immediate danger','Call emergency services and keep victim conscious','Control bleeding with direct firm pressure','Keep victim warm — treat for shock if needed'],
};

export const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'] as const;

export const SOS_LEVELS = {
  1: { label: 'Minor Emergency',    desc: 'Notify family & emergency contacts',   color: '#16a34a', bg: '#052e16' },
  2: { label: 'Medical Emergency',  desc: 'Alert nearby rescue teams & hospitals', color: '#f59e0b', bg: '#1c1200' },
  3: { label: 'Critical Emergency', desc: 'Full rescue — drones, teams & hospitals',color: '#ef4444', bg: '#450a0a' },
} as const;
