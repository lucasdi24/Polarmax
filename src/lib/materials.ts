import type { Material } from './types';

/**
 * Catálogo de materiales Polarmax — precios reales (abril 2026).
 */
export const MATERIALS: Material[] = [
  {
    id: 'seguridad',
    category: 'seguridad',
    name: 'Film de Seguridad',
    description:
      'Fortalece el vidrio y contiene las astillas en caso de rotura. Previene accidentes y actos de vandalismo.',
    icon: '🛡️',
    variants: [
      { id: 'seg-120-transp', label: '120 micrones - Transparente', bobinWidthCm: 152, pricePerLinearMeter: 28065 },
      { id: 'seg-120-claro', label: '120 micrones - Polarizado claro', bobinWidthCm: 152, pricePerLinearMeter: 30700 },
      { id: 'seg-120-inter', label: '120 micrones - Polarizado intermedio', bobinWidthCm: 152, pricePerLinearMeter: 30700 },
      { id: 'seg-120-oscuro', label: '120 micrones - Polarizado oscuro', bobinWidthCm: 152, pricePerLinearMeter: 30700 },
      { id: 'seg-200-transp', label: '200 micrones - Transparente', bobinWidthCm: 152, pricePerLinearMeter: 56600 },
      { id: 'seg-300-transp', label: '300 micrones - Transparente', bobinWidthCm: 152, pricePerLinearMeter: 97527 },
    ],
  },
  {
    id: 'espejado',
    category: 'espejado',
    name: 'Film Espejado',
    description:
      'Privacidad tipo espejo: se ve de adentro hacia afuera sin ser visto. Gran aislante térmico.',
    icon: '🪞',
    variants: [
      { id: 'esp-plata-claro', label: 'Plata claro (35%)', bobinWidthCm: 152, pricePerLinearMeter: 29000 },
      { id: 'esp-plata-inter', label: 'Plata intermedio (15%)', bobinWidthCm: 152, pricePerLinearMeter: 29000 },
      { id: 'esp-plata-oscuro', label: 'Plata oscuro (5%)', bobinWidthCm: 152, pricePerLinearMeter: 37912 },
      { id: 'esp-bronce', label: 'Bronce intermedio (15%)', bobinWidthCm: 152, pricePerLinearMeter: 29000 },
      { id: 'esp-oro', label: 'Oro intermedio (15%)', bobinWidthCm: 152, pricePerLinearMeter: 29000 },
      { id: 'esp-azul', label: 'Azul intermedio (15%)', bobinWidthCm: 152, pricePerLinearMeter: 29000 },
    ],
  },
  {
    id: 'espejado-exterior',
    category: 'espejado-exterior',
    name: 'Film Espejado Exterior (DVH)',
    description:
      'Especial para vidrios DVH (doble vidriado hermético). Se coloca por el lado exterior.',
    icon: '🏢',
    variants: [
      { id: 'esp-ext-plata', label: 'Plata exterior especial DVH', bobinWidthCm: 152, pricePerLinearMeter: 69000 },
    ],
  },
  {
    id: 'polarizado',
    category: 'polarizado',
    name: 'Film Polarizado (Control Solar)',
    description:
      'Aislante térmico, protege de los daños del sol filtrando rayos UV e infrarrojos.',
    icon: '☀️',
    variants: [
      { id: 'pol-claro', label: 'HP claro (35%)', bobinWidthCm: 152, pricePerLinearMeter: 20665 },
      { id: 'pol-inter', label: 'HP intermedio (15%)', bobinWidthCm: 152, pricePerLinearMeter: 20665 },
      { id: 'pol-oscuro', label: 'HP oscuro (5%)', bobinWidthCm: 152, pricePerLinearMeter: 20665 },
    ],
  },
  {
    id: 'nano-ceramico',
    category: 'nano-ceramico',
    name: 'Film Nano Cerámico (IR)',
    description:
      'Tecnología de última generación. Máximo rechazo de calor con alta visibilidad.',
    icon: '✨',
    variants: [
      { id: 'nano-oscuro', label: 'Oscuro (5%)', bobinWidthCm: 152, pricePerLinearMeter: 89690 },
      { id: 'nano-inter', label: 'Intermedio (15%)', bobinWidthCm: 152, pricePerLinearMeter: 89690 },
      { id: 'nano-semi', label: 'Semi transparente (75%)', bobinWidthCm: 152, pricePerLinearMeter: 98658 },
    ],
  },
  {
    id: 'esmerilado-gris',
    category: 'esmerilado',
    name: 'Film Esmerilado Gris',
    description:
      'Privacidad y decoración en tono gris, sin privar la entrada de luz.',
    icon: '🌫️',
    variants: [
      { id: 'esm-gris-31', label: 'Gris - bobina 31cm', bobinWidthCm: 31, pricePerLinearMeter: 4368 },
      { id: 'esm-gris-61', label: 'Gris - bobina 61cm', bobinWidthCm: 61, pricePerLinearMeter: 7960 },
      { id: 'esm-gris-91', label: 'Gris - bobina 91cm', bobinWidthCm: 91, pricePerLinearMeter: 12208 },
      { id: 'esm-gris-122', label: 'Gris - bobina 122cm', bobinWidthCm: 122, pricePerLinearMeter: 13328 },
      { id: 'esm-gris-152', label: 'Gris - bobina 152cm', bobinWidthCm: 152, pricePerLinearMeter: 17908 },
    ],
  },
  {
    id: 'esmerilado-cristal',
    category: 'esmerilado',
    name: 'Film Esmerilado Cristal',
    description:
      'Efecto esmerilado transparente, máxima luminosidad con privacidad.',
    icon: '💎',
    variants: [
      { id: 'esm-crist-61', label: 'Cristal - bobina 61cm', bobinWidthCm: 61, pricePerLinearMeter: 7960 },
      { id: 'esm-crist-91', label: 'Cristal - bobina 91cm', bobinWidthCm: 91, pricePerLinearMeter: 12208 },
      { id: 'esm-crist-105', label: 'Cristal - bobina 105cm', bobinWidthCm: 105, pricePerLinearMeter: 12656 },
      { id: 'esm-crist-122', label: 'Cristal - bobina 122cm', bobinWidthCm: 122, pricePerLinearMeter: 13328 },
      { id: 'esm-crist-127', label: 'Cristal - bobina 127cm', bobinWidthCm: 127, pricePerLinearMeter: 13440 },
      { id: 'esm-crist-152', label: 'Cristal - bobina 152cm', bobinWidthCm: 152, pricePerLinearMeter: 17908 },
    ],
  },
  {
    id: 'esmerilado-snow',
    category: 'esmerilado',
    name: 'Film Esmerilado Snow',
    description:
      'Acabado esmerilado blanco nieve, elegante y moderno.',
    icon: '❄️',
    variants: [
      { id: 'esm-snow-61', label: 'Snow - bobina 61cm', bobinWidthCm: 61, pricePerLinearMeter: 7960 },
      { id: 'esm-snow-91', label: 'Snow - bobina 91cm', bobinWidthCm: 91, pricePerLinearMeter: 12208 },
      { id: 'esm-snow-122', label: 'Snow - bobina 122cm', bobinWidthCm: 122, pricePerLinearMeter: 13328 },
      { id: 'esm-snow-152', label: 'Snow - bobina 152cm', bobinWidthCm: 152, pricePerLinearMeter: 17908 },
    ],
  },
  {
    id: 'esmerilado-blanco',
    category: 'esmerilado',
    name: 'Film Esmerilado Blanco',
    description:
      'Esmerilado blanco opaco, máxima privacidad.',
    icon: '⬜',
    variants: [
      { id: 'esm-blanco-152', label: 'Blanco - bobina 152cm', bobinWidthCm: 152, pricePerLinearMeter: 29000 },
    ],
  },
];

/** Margen extra por pieza en cm (para manipulación y ajuste) */
export const CUTTING_MARGIN_CM = 5;

/** Número de WhatsApp para cotizaciones */
export const WHATSAPP_NUMBER = '5491141645696';

/** Material DVH por defecto (para vidrios DVH se usa este) */
export const DVH_MATERIAL_ID = 'espejado-exterior';
