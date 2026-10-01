export const EMERGENCY_LABELS: Record<string, string> = {
  snake_bite: 'Snake Bite',
  animal_attack: 'Animal Attack',
  landslide: 'Landslide',
  flood: 'Flood',
  fire: 'Fire',
  earthquake: 'Earthquake',
  fracture: 'Fracture',
  heavy_bleeding: 'Heavy Bleeding',
  heart_attack: 'Heart Attack',
  lost_in_forest: 'Lost in Forest',
  breathing_problem: 'Breathing Problem',
  accident: 'Accident',
};

export const EMERGENCY_SEVERITY: Record<string, number> = {
  heart_attack: 3,
  heavy_bleeding: 3,
  breathing_problem: 3,
  snake_bite: 3,
  fire: 3,
  earthquake: 3,
  flood: 2,
  landslide: 2,
  animal_attack: 2,
  fracture: 2,
  lost_in_forest: 1,
  accident: 2,
};

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Minor Emergency',
  2: 'Medical Emergency',
  3: 'Critical Emergency',
};

export const FIRST_AID: Record<string, string[]> = {
  snake_bite: [
    'Keep the victim calm and still',
    'Immobilize the bitten limb below heart level',
    'Remove tight clothing/jewelry near bite',
    'Do NOT suck out venom or cut the wound',
    'Rush to hospital immediately for antivenom',
  ],
  heart_attack: [
    'Call emergency services immediately',
    'Make the person sit or lie in comfortable position',
    'Loosen tight clothing',
    'Give aspirin if available and not allergic',
    'Begin CPR if person becomes unconscious',
  ],
  heavy_bleeding: [
    'Apply firm direct pressure with clean cloth',
    'Elevate the injured area above heart level',
    'Do not remove the cloth — add more if soaked',
    'Apply tourniquet if bleeding is from limb',
    'Keep victim warm and calm',
  ],
  fracture: [
    'Do not attempt to realign the bone',
    'Immobilize with a splint or padded support',
    'Apply ice wrapped in cloth to reduce swelling',
    'Keep victim still and comfortable',
    'Seek medical help immediately',
  ],
  fire: [
    'Stop, Drop, and Roll if clothes are on fire',
    'Cool burns with cool running water for 10 minutes',
    'Do not use ice, butter, or toothpaste',
    'Cover loosely with clean dressing',
    'Seek immediate medical attention for serious burns',
  ],
  flood: [
    'Move to higher ground immediately',
    'Do not walk in moving water',
    'Avoid electrical equipment',
    'Signal for help from elevated position',
    'Stay together and await rescue',
  ],
  earthquake: [
    'Drop, Cover, and Hold On',
    'Stay away from windows and heavy furniture',
    'If outdoors, move away from buildings',
    'After shaking stops, check for injuries',
    'Be prepared for aftershocks',
  ],
  landslide: [
    'Move quickly away from the slide path',
    'Curl into a ball to protect vital organs',
    'Cover mouth with clothing to avoid dust',
    'Signal rescuers once safe',
    'Do not re-enter slide area',
  ],
  lost_in_forest: [
    'Stay in one place and signal for help',
    'Use whistle or bright colored items to attract attention',
    'Stay warm and conserve energy',
    'Find or build shelter if possible',
    'Follow water downstream to find civilization',
  ],
  animal_attack: [
    'Do not run — back away slowly',
    'Make yourself appear large and make noise',
    'If attacked, protect neck and vital areas',
    'Apply pressure to wounds',
    'Seek medical attention for bites or scratches',
  ],
  breathing_problem: [
    'Help person sit upright',
    'Loosen tight clothing around neck and chest',
    'Use inhaler if available',
    'Begin rescue breathing if unconscious',
    'Call emergency services immediately',
  ],
  accident: [
    'Ensure scene safety before approaching',
    'Call emergency services immediately',
    'Do not move injured unless danger present',
    'Control bleeding with direct pressure',
    'Keep victim warm and conscious',
  ],
};
