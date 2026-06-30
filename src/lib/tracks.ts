import { TRACK_TRACES } from "./track-traces";

export interface TrackLayout {
  id: string;
  name: string;
  lengthKm: number;
  /** SVG viewBox */
  viewBox: string;
  /** SVG path d attribute for track outline */
  path: string;
  /** Centerline keypoints — cars follow this polyline */
  centerline: [number, number][];
  /** Start/finish line position [x, y] in viewBox coords */
  startLine: [number, number];
  /** RaceTracksAPI image id used as trace source */
  traceId?: string;
}

export interface Track {
  id: string;
  name: string;
  country: string;
  layouts: TrackLayout[];
}

function fromTrace(
  id: string,
  name: string,
  lengthKm: number,
  traceKey: string
): TrackLayout {
  const trace = TRACK_TRACES[traceKey];
  if (!trace) throw new Error(`Missing track trace: ${traceKey}`);
  return {
    id,
    name,
    lengthKm,
    viewBox: trace.viewBox,
    path: trace.path,
    centerline: trace.centerline,
    startLine: trace.startLine,
    traceId: trace.imageId,
  };
}

/** LMU circuit layouts — traces from RaceTracksAPI SVG maps */
export const TRACKS: Track[] = [
  {
    id: "le-mans",
    name: "Circuit de la Sarthe",
    country: "France",
    layouts: [
      fromTrace("full", "24h Layout", 13.626, "leMansFull"),
      fromTrace("no-chicane", "Mulsanne No Chicanes", 13.535, "leMansNoChicane"),
    ],
  },
  {
    id: "spa",
    name: "Spa-Francorchamps",
    country: "Belgium",
    layouts: [
      fromTrace("gp", "Grand Prix", 7.004, "spa"),
      fromTrace("endurance", "Endurance Layout", 7.004, "spa"),
    ],
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    country: "Italy",
    layouts: [
      fromTrace("gp", "Grand Prix", 5.793, "monzaGp"),
      fromTrace("curva-grande", "Curva Grande Layout", 5.793, "monzaCurvaGrande"),
    ],
  },
  {
    id: "fuji",
    name: "Fuji Speedway",
    country: "Japan",
    layouts: [
      fromTrace("gp", "Grand Prix", 4.563, "fujiGp"),
      fromTrace("classic", "Classic (No Chicane)", 4.563, "fujiClassic"),
    ],
  },
  {
    id: "bahrain",
    name: "Bahrain International Circuit",
    country: "Bahrain",
    layouts: [
      fromTrace("gp", "Grand Prix", 5.412, "bahrainGp"),
      fromTrace("endurance", "Endurance Circuit", 6.299, "bahrainEndurance"),
      fromTrace("outer", "Outer Circuit", 3.543, "bahrainOuter"),
      fromTrace("paddock", "Paddock Circuit", 2.555, "bahrainPaddock"),
    ],
  },
  {
    id: "sebring",
    name: "Sebring International Raceway",
    country: "USA",
    layouts: [
      fromTrace("gp", "Grand Prix", 6.019, "sebringGp"),
      fromTrace("school", "School Circuit", 3.7, "sebringSchool"),
    ],
  },
  {
    id: "portimao",
    name: "Algarve International Circuit",
    country: "Portugal",
    layouts: [fromTrace("gp", "Grand Prix", 4.653, "portimao")],
  },
  {
    id: "imola",
    name: "Autodromo Enzo e Dino Ferrari",
    country: "Italy",
    layouts: [fromTrace("gp", "Grand Prix", 4.909, "imola")],
  },
  {
    id: "cota",
    name: "Circuit of the Americas",
    country: "USA",
    layouts: [
      fromTrace("gp", "Grand Prix", 5.513, "cotaGp"),
      fromTrace("national", "National", 3.702, "cotaNational"),
    ],
  },
  {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    country: "Brazil",
    layouts: [fromTrace("gp", "Grand Prix", 4.309, "interlagos")],
  },
  {
    id: "lusail",
    name: "Lusail International Circuit",
    country: "Qatar",
    layouts: [
      fromTrace("gp", "Grand Prix", 5.38, "lusail"),
      fromTrace("short", "Short Layout", 3.28, "lusailShort"),
    ],
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    country: "UK",
    layouts: [
      fromTrace("gp", "Grand Prix (WEC)", 5.891, "silverstoneGp"),
      fromTrace("national", "National", 2.639, "silverstoneNational"),
      fromTrace("international", "International", 3.66, "silverstoneInternational"),
    ],
  },
  {
    id: "paul-ricard",
    name: "Circuit Paul Ricard",
    country: "France",
    layouts: [fromTrace("gp", "Grand Prix (1A)", 5.842, "paulRicard")],
  },
  {
    id: "barcelona",
    name: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    layouts: [fromTrace("gp", "Grand Prix", 4.675, "barcelona")],
  },
];

export const CAR_CLASSES = ["Hypercar", "LMP2", "LMGT3", "GTE"] as const;

export function getTrack(id: string): Track | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getTrackLayout(trackId: string, layoutId: string): TrackLayout | undefined {
  const track = getTrack(trackId);
  return track?.layouts.find((l) => l.id === layoutId) ?? track?.layouts[0];
}

export { progressToPosition } from "./track-geometry";
