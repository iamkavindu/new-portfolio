import satori from 'satori';
import sharp from 'sharp';

export interface OgCardInput {
  title: string;
  description: string;
  kind: 'Writing' | 'Work';
}

let fontRegular: ArrayBuffer | null = null;
let fontBold: ArrayBuffer | null = null;

async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontRegular && fontBold) {
    return { regular: fontRegular, bold: fontBold };
  }

  const [regular, bold] = await Promise.all([
    fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.2.5/latin-400-normal.ttf'
    ).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch Inter 400: ${r.status}`);
      return r.arrayBuffer();
    }),
    fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@5.2.5/latin-700-normal.ttf'
    ).then((r) => {
      if (!r.ok) throw new Error(`Failed to fetch Inter 700: ${r.status}`);
      return r.arrayBuffer();
    }),
  ]);

  fontRegular = regular;
  fontBold = bold;
  return { regular, bold };
}

/** Build a 1200×630 PNG share card (dark slate + teal accent). */
export async function renderOgPng(input: OgCardInput): Promise<Buffer> {
  const { regular, bold } = await loadFonts();
  const title =
    input.title.length > 90 ? `${input.title.slice(0, 87)}…` : input.title;
  const description =
    input.description.length > 160
      ? `${input.description.slice(0, 157)}…`
      : input.description;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0b1220',
          borderLeft: '16px solid #2da8a8',
          padding: '64px 72px',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 22,
                fontWeight: 700,
                color: '#2da8a8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 28,
              },
              children: input.kind,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: title.length > 60 ? 42 : 52,
                      fontWeight: 700,
                      color: '#f8fafc',
                      lineHeight: 1.2,
                      marginBottom: 24,
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      fontSize: 26,
                      fontWeight: 400,
                      color: '#94a3b8',
                      lineHeight: 1.4,
                    },
                    children: description,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                fontSize: 22,
                fontWeight: 400,
                color: '#64748b',
              },
              children: 'iamkavindu.dev',
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );

  return sharp(Buffer.from(svg)).png().toBuffer();
}
