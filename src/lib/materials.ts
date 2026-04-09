import type { Material } from './types';

/**
 * Catálogo de materiales Polarmax.
 * Los precios son placeholder — editar acá cuando lleguen los reales.
 */
export const MATERIALS: Material[] = [
  {
    id: 'seguridad',
    category: 'seguridad',
    name: 'Film de Seguridad',
    description:
      'Fortalece el vidrio y contiene las astillas en caso de rotura. Previene accidentes y actos de vandalismo.',
    variants: [
      { id: 'seg-transparente', label: 'Transparente' },
      { id: 'seg-pol-claro', label: 'Polarizado claro' },
      { id: 'seg-pol-intermedio', label: 'Polarizado intermedio' },
      { id: 'seg-pol-oscuro', label: 'Polarizado oscuro' },
    ],
    bobinWidthCm: 152,
    pricePerLinearMeter: 15000,
    icon: '🛡️',
  },
  {
    id: 'espejado',
    category: 'espejado',
    name: 'Film Espejado',
    description:
      'Privacidad tipo espejo: se ve de adentro hacia afuera sin ser visto. Gran aislante térmico.',
    variants: [
      { id: 'esp-bronce', label: 'Bronce' },
      { id: 'esp-oro', label: 'Oro' },
      { id: 'esp-plata-int', label: 'Plata intermedio' },
      { id: 'esp-plata-osc', label: 'Plata oscuro' },
      { id: 'esp-azul', label: 'Azul' },
    ],
    bobinWidthCm: 152,
    pricePerLinearMeter: 18000,
    icon: '🪞',
  },
  {
    id: 'esmerilado',
    category: 'esmerilado',
    name: 'Film Esmerilado',
    description:
      'Aumentan la privacidad y decoran ambientes sin privar la entrada de luz.',
    variants: [
      { id: 'esm-difuminado', label: 'Difuminado' },
      { id: 'esm-ciego', label: 'Ciego' },
    ],
    bobinWidthCm: 152,
    pricePerLinearMeter: 12000,
    icon: '🌫️',
  },
  {
    id: 'control-solar',
    category: 'control-solar',
    name: 'Film de Control Solar',
    description:
      'Aislante térmico, protege de los daños del sol filtrando rayos UV e infrarrojos.',
    variants: [
      { id: 'sol-semi', label: 'Semi-transparente' },
      { id: 'sol-claro', label: 'Claro' },
      { id: 'sol-intermedio', label: 'Intermedio' },
      { id: 'sol-oscuro', label: 'Oscuro' },
    ],
    bobinWidthCm: 152,
    pricePerLinearMeter: 14000,
    icon: '☀️',
  },
  {
    id: 'seguridad-exterior',
    category: 'seguridad-exterior',
    name: 'Film de Seguridad Exterior (DVH)',
    description:
      'Especial para vidrios DVH (doble vidriado hermético). Se coloca por el lado exterior.',
    variants: [{ id: 'seg-ext-transparente', label: 'Transparente' }],
    bobinWidthCm: 152,
    pricePerLinearMeter: 22000,
    icon: '🏢',
  },
];

/** Margen extra por pieza en cm (para manipulación y ajuste) */
export const CUTTING_MARGIN_CM = 5;

/** Número de WhatsApp para cotizaciones */
export const WHATSAPP_NUMBER = '5491141645696';
