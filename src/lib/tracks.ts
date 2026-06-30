import { CENTERLINES } from "./track-centerlines";
import { centerlineToPath } from "./track-geometry";

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
}

export interface Track {
  id: string;
  name: string;
  country: string;
  layouts: TrackLayout[];
}

function layout(
  id: string,
  name: string,
  lengthKm: number,
  viewBox: string,
  centerline: [number, number][],
  startIndex = 0
): TrackLayout {
  return {
    id,
    name,
    lengthKm,
    viewBox,
    centerline,
    path: centerlineToPath(centerline),
    startLine: centerline[startIndex] ?? centerline[0],
  };
}

/** Circuit outlines for LMU tracks — centerlines traced from real layouts */
export const TRACKS: Track[] = [
  {
    id: "le-mans",
    name: "Circuit de la Sarthe",
    country: "France",
    layouts: [
      layout("full", "24h Layout", 13.626, "0 0 800 280", CENTERLINES.leMans),
      layout("no-chicane", "Mulsanne No Chicanes", 13.535, "0 0 800 280", CENTERLINES.leMans),
    ],
  },
  {
    id: "spa",
    name: "Spa-Francorchamps",
    country: "Belgium",
    layouts: [
      layout("gp", "Grand Prix", 7.004, "0 0 640 520", CENTERLINES.spa),
      layout("endurance", "Endurance Layout", 7.004, "0 0 640 520", CENTERLINES.spa),
    ],
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    country: "Italy",
    layouts: [
      layout("gp", "Grand Prix", 5.793, "0 0 680 280", CENTERLINES.monza),
      layout("curva-grande", "Curva Grande Layout", 5.793, "0 0 680 280", CENTERLINES.monza),
    ],
  },
  {
    id: "fuji",
    name: "Fuji Speedway",
    country: "Japan",
    layouts: [
      layout("gp", "Grand Prix", 4.563, "0 0 550 400", CENTERLINES.fuji),
      layout("classic", "Classic (No Chicane)", 4.563, "0 0 550 400", CENTERLINES.fuji),
    ],
  },
  {
    id: "bahrain",
    name: "Bahrain International Circuit",
    country: "Bahrain",
    layouts: [
      layout("gp", "Grand Prix", 5.412, "0 0 500 450", CENTERLINES.bahrainGp),
      layout("endurance", "Endurance Circuit", 6.299, "0 0 550 480", CENTERLINES.bahrainEndurance),
      layout("outer", "Outer Circuit", 3.543, "0 0 450 400", CENTERLINES.bahrainOuter),
      layout("paddock", "Paddock Circuit", 2.555, "0 0 400 350", CENTERLINES.bahrainPaddock),
    ],
  },
  {
    id: "sebring",
    name: "Sebring International Raceway",
    country: "USA",
    layouts: [
      layout("gp", "Grand Prix", 6.019, "0 0 600 450", CENTERLINES.sebring),
      layout("school", "School Circuit", 3.7, "0 0 450 350", CENTERLINES.sebringSchool),
    ],
  },
  {
    id: "portimao",
    name: "Algarve International Circuit",
    country: "Portugal",
    layouts: [layout("gp", "Grand Prix", 4.653, "0 0 550 420", CENTERLINES.portimao)],
  },
  {
    id: "imola",
    name: "Autodromo Enzo e Dino Ferrari",
    country: "Italy",
    layouts: [layout("gp", "Grand Prix", 4.909, "0 0 500 480", CENTERLINES.imola)],
  },
  {
    id: "cota",
    name: "Circuit of the Americas",
    country: "USA",
    layouts: [
      layout("gp", "Grand Prix", 5.513, "0 0 550 450", CENTERLINES.cota),
      layout("national", "National", 3.702, "0 0 450 380", CENTERLINES.cotaNational),
    ],
  },
  {
    id: "interlagos",
    name: "Autódromo José Carlos Pace",
    country: "Brazil",
    layouts: [layout("gp", "Grand Prix", 4.309, "0 0 480 420", CENTERLINES.interlagos)],
  },
  {
    id: "lusail",
    name: "Lusail International Circuit",
    country: "Qatar",
    layouts: [
      layout("gp", "Grand Prix", 5.38, "0 0 520 400", CENTERLINES.lusail),
      layout("short", "Short Layout", 3.28, "0 0 420 340", CENTERLINES.lusailShort),
    ],
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    country: "UK",
    layouts: [
      layout("gp", "Grand Prix (WEC)", 5.891, "0 0 580 420", CENTERLINES.silverstoneGp),
      layout("national", "National", 2.639, "0 0 400 320", CENTERLINES.silverstoneNational),
      layout("international", "International", 3.66, "0 0 450 350", CENTERLINES.silverstoneInternational),
    ],
  },
  {
    id: "paul-ricard",
    name: "Circuit Paul Ricard",
    country: "France",
    layouts: [layout("gp", "Grand Prix (1A)", 5.842, "0 0 560 400", CENTERLINES.paulRicard)],
  },
  {
    id: "barcelona",
    name: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    layouts: [layout("gp", "Grand Prix", 4.675, "0 0 540 420", CENTERLINES.barcelona)],
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
