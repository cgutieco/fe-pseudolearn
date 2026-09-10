export interface IconDefinition {
  readonly paths: readonly string[];
  readonly circles?: readonly { cx: number; cy: number; r: number }[];
  readonly rects?: readonly { x: number; y: number; width: number; height: number; rx: number }[];
  readonly linejoin?: boolean;
}

export const ICONS = {
  sun: {
    paths: ['M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4'],
    circles: [{ cx: 12, cy: 12, r: 4.2 }],
  },
  moon: { paths: ['M20 14.2A8.2 8.2 0 0 1 9.8 4 8.4 8.4 0 1 0 20 14.2Z'], linejoin: true },
  chevronDown: { paths: ['M6 9l6 6 6-6'], linejoin: true },
  menu: { paths: ['M4 7h16M4 12h16M4 17h16'] },
  download: { paths: ['M12 3v12', 'M7.5 10.5 12 15l4.5-4.5', 'M4 19h16'], linejoin: true },
  arrowRight: { paths: ['M5 12h13', 'M13 7l5 5-5 5'], linejoin: true },
  laptop: {
    paths: ['M2 19.5h20'],
    rects: [{ x: 3, y: 4.5, width: 18, height: 12, rx: 1.6 }],
    linejoin: true,
  },
  phone: {
    paths: ['M10.6 5.4h2.8'],
    rects: [{ x: 6.5, y: 2.5, width: 11, height: 19, rx: 2.2 }],
    linejoin: true,
  },
  info: { paths: ['M12 11v5.5M12 7.8v.2'], circles: [{ cx: 12, cy: 12, r: 8.5 }] },
  alert: { paths: ['M12 7.6v5M12 16.2v.2'], circles: [{ cx: 12, cy: 12, r: 8.5 }] },
  check: { paths: ['M5 12.5l4.5 4.5L19 7.5'], linejoin: true },
  cross: { paths: ['M7 7l10 10M17 7L7 17'] },
  send: { paths: ['M20 4L3.5 10.5l6.5 2.6L12.6 20Z'], linejoin: true },
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;
