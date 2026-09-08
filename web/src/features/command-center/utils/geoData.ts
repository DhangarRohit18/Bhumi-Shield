export interface GeoCoordinate {
  lat: number;
  lng: number;
  zoom?: number;
}

export const INDIA_CENTER: GeoCoordinate = { lat: 22.5937, lng: 78.9629, zoom: 5 };

export const STATE_COORDINATES: Record<string, GeoCoordinate> = {
  'state-mh': { lat: 19.7515, lng: 75.7139, zoom: 7 },
  'state-gj': { lat: 22.2587, lng: 71.1924, zoom: 7 },
  'state-up': { lat: 26.8467, lng: 80.9462, zoom: 7 },
  'state-ka': { lat: 15.3173, lng: 75.7139, zoom: 7 },
  'state-tn': { lat: 11.1271, lng: 78.6569, zoom: 7 },
};

export const DISTRICT_COORDINATES: Record<string, GeoCoordinate> = {
  'dist-palghar': { lat: 19.6967, lng: 72.7699, zoom: 11 },
  'dist-thane': { lat: 19.2183, lng: 72.9781, zoom: 11 },
  'dist-ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 11 },
  'dist-surat': { lat: 21.1702, lng: 72.8311, zoom: 11 },
  'dist-varanasi': { lat: 25.3176, lng: 82.9739, zoom: 11 },
  'dist-bengaluru-rural': { lat: 13.2846, lng: 77.5543, zoom: 11 },
};

export interface CorridorPolyline {
  projectId: string;
  projectName: string;
  color: string;
  points: [number, number][];
}

export const STRATEGIC_CORRIDORS: CorridorPolyline[] = [
  {
    projectId: 'proj-bullet-train-sec-3',
    projectName: 'Mumbai-Ahmedabad High Speed Rail (MAHSR)',
    color: '#06b6d4',
    points: [
      [19.0760, 72.8777], // Mumbai BKC
      [19.2183, 72.9781], // Thane
      [19.6200, 72.7400], // Kelve
      [19.6967, 72.7699], // Palghar
      [20.3893, 72.9106], // Vapi
      [21.1702, 72.8311], // Surat
      [22.3072, 73.1812], // Vadodara
      [23.0225, 72.5714], // Ahmedabad
    ],
  },
  {
    projectId: 'proj-delhi-mumbai-exp',
    projectName: 'Delhi-Mumbai Expressway (PKG-17)',
    color: '#10b981',
    points: [
      [28.6139, 77.2090], // Delhi
      [28.2500, 77.0600], // Gurgaon
      [26.8900, 76.3300], // Jaipur
      [25.1852, 75.8364], // Kota
      [23.3315, 75.0367], // Ratlam
      [21.1702, 72.8311], // Surat
      [19.2183, 72.9781], // Mumbai outer
    ],
  },
  {
    projectId: 'proj-eastern-dfc',
    projectName: 'Eastern Dedicated Freight Corridor (EDFC-UP)',
    color: '#f59e0b',
    points: [
      [28.2500, 77.8500], // Khurja
      [27.2000, 78.2300], // Tundla
      [26.4499, 80.3319], // Kanpur
      [25.4358, 81.8463], // Prayagraj
      [25.3176, 82.9739], // Varanasi / DDU
      [24.7955, 85.0002], // Sonnagar
    ],
  },
];
