export interface TrackLayout {
  id: string;
  name: string;
  lengthKm: number;
  /** SVG viewBox */
  viewBox: string;
  /** SVG path d attribute for track outline */
  path: string;
  /** Start/finish line position [x, y] in viewBox coords */
  startLine: [number, number];
}

export interface Track {
  id: string;
  name: string;
  country: string;
  layouts: TrackLayout[];
}

/** Simplified circuit outlines for LMU tracks — normalized to viewBox coordinates */
export const TRACKS: Track[] = [
  {
    id: "le-mans",
    name: "Circuit de la Sarthe",
    country: "France",
    layouts: [
      {
        id: "full",
        name: "24h Layout",
        lengthKm: 13.626,
        viewBox: "0 0 800 400",
        path: "M 120,200 L 80,180 L 60,150 L 50,120 L 55,90 L 70,70 L 100,55 L 140,50 L 180,55 L 220,65 L 260,80 L 300,90 L 340,85 L 380,75 L 420,70 L 460,75 L 500,85 L 540,95 L 580,100 L 620,95 L 660,85 L 700,80 L 730,90 L 750,110 L 760,140 L 755,170 L 740,195 L 710,210 L 680,215 L 650,210 L 620,200 L 590,195 L 560,200 L 530,210 L 500,215 L 470,210 L 440,200 L 410,190 L 380,185 L 350,190 L 320,200 L 290,210 L 260,215 L 230,210 L 200,200 L 170,195 L 140,200 Z",
        startLine: [120, 200],
      },
      {
        id: "no-chicane",
        name: "Mulsanne No Chicanes",
        lengthKm: 13.535,
        viewBox: "0 0 800 400",
        path: "M 120,200 L 80,180 L 60,150 L 50,120 L 55,90 L 70,70 L 100,55 L 140,50 L 180,55 L 220,65 L 260,80 L 300,90 L 340,85 L 380,75 L 420,70 L 460,75 L 500,85 L 540,95 L 580,100 L 620,95 L 660,85 L 700,80 L 730,90 L 750,110 L 760,140 L 755,170 L 740,195 L 710,210 L 680,215 L 650,210 L 620,200 L 590,195 L 560,200 L 530,210 L 500,215 L 470,210 L 440,200 L 410,190 L 380,185 L 350,190 L 320,200 L 290,210 L 260,215 L 230,210 L 200,200 L 170,195 L 140,200 Z",
        startLine: [120, 200],
      },
    ],
  },
  {
    id: "spa",
    name: "Spa-Francorchamps",
    country: "Belgium",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 7.004,
        viewBox: "0 0 600 500",
        path: "M 300,450 L 250,440 L 200,420 L 160,390 L 130,350 L 110,300 L 100,250 L 110,200 L 130,160 L 160,130 L 200,110 L 250,100 L 300,95 L 350,100 L 400,110 L 440,130 L 470,160 L 490,200 L 500,250 L 490,300 L 470,340 L 440,370 L 400,390 L 350,400 L 300,405 L 280,420 L 270,440 L 300,450 Z",
        startLine: [300, 450],
      },
      {
        id: "endurance",
        name: "Endurance Layout",
        lengthKm: 7.004,
        viewBox: "0 0 600 500",
        path: "M 300,450 L 250,440 L 200,420 L 160,390 L 130,350 L 110,300 L 100,250 L 110,200 L 130,160 L 160,130 L 200,110 L 250,100 L 300,95 L 350,100 L 400,110 L 440,130 L 470,160 L 490,200 L 500,250 L 490,300 L 470,340 L 440,370 L 400,390 L 350,400 L 300,405 L 280,420 L 270,440 L 300,450 Z",
        startLine: [300, 450],
      },
    ],
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    country: "Italy",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 5.793,
        viewBox: "0 0 700 300",
        path: "M 100,150 L 150,140 L 200,130 L 280,125 L 360,120 L 440,125 L 520,130 L 580,140 L 620,150 L 640,160 L 650,170 L 640,180 L 620,190 L 580,200 L 520,210 L 440,215 L 360,220 L 280,215 L 200,210 L 150,200 L 100,190 L 80,180 L 70,170 L 80,160 L 100,150 Z",
        startLine: [100, 150],
      },
      {
        id: "curva-grande",
        name: "Curva Grande Layout",
        lengthKm: 5.793,
        viewBox: "0 0 700 300",
        path: "M 100,150 L 150,140 L 200,130 L 280,125 L 360,120 L 440,125 L 520,130 L 580,140 L 620,150 L 640,160 L 650,170 L 640,180 L 620,190 L 580,200 L 520,210 L 440,215 L 360,220 L 280,215 L 200,210 L 150,200 L 100,190 L 80,180 L 70,170 L 80,160 L 100,150 Z",
        startLine: [100, 150],
      },
    ],
  },
  {
    id: "fuji",
    name: "Fuji Speedway",
    country: "Japan",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 4.563,
        viewBox: "0 0 550 400",
        path: "M 275,350 L 220,340 L 170,320 L 130,290 L 100,250 L 85,200 L 90,150 L 110,110 L 140,80 L 180,60 L 230,50 L 275,48 L 320,50 L 370,60 L 410,80 L 440,110 L 460,150 L 465,200 L 450,250 L 420,290 L 380,320 L 330,340 L 275,350 Z",
        startLine: [275, 350],
      },
      {
        id: "classic",
        name: "Classic (No Chicane)",
        lengthKm: 4.563,
        viewBox: "0 0 550 400",
        path: "M 275,350 L 220,340 L 170,320 L 130,290 L 100,250 L 85,200 L 90,150 L 110,110 L 140,80 L 180,60 L 230,50 L 275,48 L 320,50 L 370,60 L 410,80 L 440,110 L 460,150 L 465,200 L 450,250 L 420,290 L 380,320 L 330,340 L 275,350 Z",
        startLine: [275, 350],
      },
    ],
  },
  {
    id: "bahrain",
    name: "Bahrain International Circuit",
    country: "Bahrain",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 5.412,
        viewBox: "0 0 500 450",
        path: "M 250,400 L 200,390 L 150,370 L 110,340 L 80,300 L 65,250 L 70,200 L 90,150 L 120,110 L 160,80 L 210,65 L 250,60 L 290,65 L 340,80 L 380,110 L 410,150 L 430,200 L 435,250 L 420,300 L 390,340 L 350,370 L 300,390 L 250,400 Z",
        startLine: [250, 400],
      },
      {
        id: "endurance",
        name: "Endurance Circuit",
        lengthKm: 6.299,
        viewBox: "0 0 550 480",
        path: "M 275,430 L 220,420 L 170,400 L 130,370 L 100,330 L 80,280 L 75,230 L 85,180 L 110,135 L 150,100 L 200,75 L 250,65 L 300,75 L 350,100 L 390,135 L 415,180 L 425,230 L 420,280 L 400,330 L 370,370 L 330,400 L 280,420 L 275,430 Z",
        startLine: [275, 430],
      },
      {
        id: "outer",
        name: "Outer Circuit",
        lengthKm: 3.543,
        viewBox: "0 0 450 400",
        path: "M 225,360 L 180,350 L 140,330 L 110,300 L 90,260 L 85,220 L 95,180 L 120,145 L 160,120 L 200,110 L 225,108 L 250,110 L 290,120 L 330,145 L 355,180 L 365,220 L 360,260 L 340,300 L 310,330 L 270,350 L 225,360 Z",
        startLine: [225, 360],
      },
      {
        id: "paddock",
        name: "Paddock Circuit",
        lengthKm: 2.555,
        viewBox: "0 0 400 350",
        path: "M 200,310 L 160,300 L 125,280 L 100,250 L 85,215 L 90,180 L 110,150 L 140,130 L 175,120 L 200,118 L 225,120 L 260,130 L 290,150 L 310,180 L 315,215 L 300,250 L 275,280 L 240,300 L 200,310 Z",
        startLine: [200, 310],
      },
    ],
  },
  {
    id: "sebring",
    name: "Sebring International Raceway",
    country: "USA",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 6.019,
        viewBox: "0 0 600 450",
        path: "M 300,400 L 240,390 L 180,370 L 130,340 L 90,300 L 65,250 L 60,200 L 75,150 L 105,110 L 150,80 L 200,65 L 250,60 L 300,58 L 350,60 L 400,65 L 450,80 L 495,110 L 525,150 L 540,200 L 535,250 L 510,300 L 470,340 L 420,370 L 360,390 L 300,400 Z",
        startLine: [300, 400],
      },
      {
        id: "school",
        name: "School Circuit",
        lengthKm: 3.7,
        viewBox: "0 0 450 350",
        path: "M 225,310 L 180,300 L 140,280 L 110,250 L 90,215 L 85,180 L 100,145 L 130,120 L 170,105 L 225,100 L 280,105 L 320,120 L 350,145 L 365,180 L 360,215 L 340,250 L 310,280 L 270,300 L 225,310 Z",
        startLine: [225, 310],
      },
    ],
  },
  {
    id: "portimao",
    name: "Algarve International Circuit",
    country: "Portugal",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 4.653,
        viewBox: "0 0 550 420",
        path: "M 275,380 L 220,370 L 170,350 L 130,320 L 100,280 L 80,235 L 75,190 L 85,145 L 110,105 L 150,75 L 200,55 L 250,48 L 275,47 L 300,48 L 350,55 L 400,75 L 440,105 L 465,145 L 475,190 L 470,235 L 450,280 L 420,320 L 380,350 L 330,370 L 275,380 Z",
        startLine: [275, 380],
      },
    ],
  },
  {
    id: "imola",
    name: "Autodromo Enzo e Dino Ferrari",
    country: "Italy",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 4.909,
        viewBox: "0 0 500 480",
        path: "M 250,430 L 200,420 L 155,400 L 120,370 L 95,330 L 80,285 L 78,240 L 90,195 L 115,155 L 150,125 L 195,105 L 250,98 L 305,105 L 350,125 L 385,155 L 410,195 L 422,240 L 420,285 L 405,330 L 380,370 L 345,400 L 300,420 L 250,430 Z",
        startLine: [250, 430],
      },
    ],
  },
  {
    id: "cota",
    name: "Circuit of the Americas",
    country: "USA",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 5.513,
        viewBox: "0 0 550 450",
        path: "M 275,400 L 220,390 L 170,370 L 130,340 L 100,300 L 80,255 L 75,210 L 85,165 L 110,125 L 150,95 L 200,75 L 250,68 L 275,67 L 300,68 L 350,75 L 400,95 L 440,125 L 465,165 L 475,210 L 470,255 L 450,300 L 420,340 L 380,370 L 330,390 L 275,400 Z",
        startLine: [275, 400],
      },
      {
        id: "national",
        name: "National",
        lengthKm: 3.702,
        viewBox: "0 0 450 380",
        path: "M 225,340 L 180,330 L 140,310 L 110,280 L 90,245 L 85,210 L 95,175 L 120,145 L 155,125 L 200,115 L 225,113 L 250,115 L 295,125 L 330,145 L 355,175 L 365,210 L 360,245 L 340,280 L 310,310 L 270,330 L 225,340 Z",
        startLine: [225, 340],
      },
    ],
  },
  {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    country: "Brazil",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 4.309,
        viewBox: "0 0 480 420",
        path: "M 240,380 L 190,370 L 145,350 L 110,320 L 85,280 L 72,235 L 75,190 L 92,148 L 120,115 L 160,90 L 205,75 L 240,70 L 275,75 L 320,90 L 360,115 L 388,148 L 405,190 L 408,235 L 395,280 L 370,320 L 335,350 L 290,370 L 240,380 Z",
        startLine: [240, 380],
      },
    ],
  },
  {
    id: "lusail",
    name: "Lusail International Circuit",
    country: "Qatar",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 5.38,
        viewBox: "0 0 520 400",
        path: "M 260,360 L 210,350 L 165,330 L 130,300 L 105,260 L 90,215 L 88,170 L 100,125 L 125,90 L 165,65 L 210,52 L 260,48 L 310,52 L 355,65 L 395,90 L 420,125 L 432,170 L 430,215 L 415,260 L 390,300 L 355,330 L 310,350 L 260,360 Z",
        startLine: [260, 360],
      },
      {
        id: "short",
        name: "Short Layout",
        lengthKm: 3.28,
        viewBox: "0 0 420 340",
        path: "M 210,300 L 170,290 L 135,270 L 110,240 L 95,205 L 92,170 L 105,135 L 130,110 L 165,95 L 210,90 L 255,95 L 290,110 L 315,135 L 328,170 L 325,205 L 310,240 L 285,270 L 250,290 L 210,300 Z",
        startLine: [210, 300],
      },
    ],
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    country: "UK",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix (WEC)",
        lengthKm: 5.891,
        viewBox: "0 0 580 420",
        path: "M 290,380 L 235,370 L 185,350 L 145,320 L 115,280 L 95,235 L 88,190 L 98,145 L 125,105 L 165,75 L 215,55 L 265,48 L 290,47 L 315,48 L 365,55 L 415,75 L 455,105 L 482,145 L 492,190 L 485,235 L 465,280 L 435,320 L 395,350 L 345,370 L 290,380 Z",
        startLine: [290, 380],
      },
      {
        id: "national",
        name: "National",
        lengthKm: 2.639,
        viewBox: "0 0 400 320",
        path: "M 200,280 L 160,270 L 125,250 L 100,220 L 85,185 L 82,150 L 95,115 L 120,90 L 155,75 L 200,70 L 245,75 L 280,90 L 305,115 L 318,150 L 315,185 L 300,220 L 275,250 L 240,270 L 200,280 Z",
        startLine: [200, 280],
      },
      {
        id: "international",
        name: "International",
        lengthKm: 3.660,
        viewBox: "0 0 450 350",
        path: "M 225,310 L 180,300 L 140,280 L 110,250 L 90,215 L 85,180 L 95,145 L 120,115 L 155,95 L 200,85 L 225,83 L 250,85 L 295,95 L 330,115 L 355,145 L 365,180 L 360,215 L 340,250 L 310,280 L 270,300 L 225,310 Z",
        startLine: [225, 310],
      },
    ],
  },
  {
    id: "paul-ricard",
    name: "Circuit Paul Ricard",
    country: "France",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix (1A)",
        lengthKm: 5.842,
        viewBox: "0 0 560 400",
        path: "M 280,360 L 225,350 L 175,330 L 135,300 L 105,260 L 88,215 L 85,170 L 98,125 L 125,88 L 170,60 L 220,48 L 280,44 L 340,48 L 390,60 L 435,88 L 462,125 L 475,170 L 472,215 L 455,260 L 425,300 L 385,330 L 335,350 L 280,360 Z",
        startLine: [280, 360],
      },
    ],
  },
  {
    id: "barcelona",
    name: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    layouts: [
      {
        id: "gp",
        name: "Grand Prix",
        lengthKm: 4.675,
        viewBox: "0 0 540 420",
        path: "M 270,380 L 215,370 L 165,350 L 125,320 L 95,280 L 78,235 L 75,190 L 88,145 L 118,105 L 160,75 L 210,58 L 270,52 L 330,58 L 380,75 L 422,105 L 452,145 L 465,190 L 462,235 L 445,280 L 415,320 L 375,350 L 325,370 L 270,380 Z",
        startLine: [270, 380],
      },
    ],
  },
];

export const CAR_CLASSES = [
  "Hypercar",
  "LMP2",
  "LMGT3",
  "GTE",
] as const;

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getTrackLayout(trackId: string, layoutId: string): TrackLayout | undefined {
  const track = getTrack(trackId);
  return track?.layouts.find((l) => l.id === layoutId);
}

/** Map normalized lap progress (0-1) to x,y on track path (approximation) */
export function progressToPosition(
  layout: TrackLayout,
  progress: number
): [number, number] {
  const [x1, y1, x2, y2] = layout.viewBox.split(" ").map(Number);
  const w = x2 - x1;
  const h = y2 - y1;
  const angle = progress * Math.PI * 2;
  const cx = w / 2;
  const cy = h / 2;
  const rx = w * 0.38;
  const ry = h * 0.38;
  return [cx + Math.cos(angle) * rx, cy + Math.sin(angle) * ry];
}
