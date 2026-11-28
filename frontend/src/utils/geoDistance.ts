export function calculateGeoDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}

/**
 * Computes conservative city-road ETA minutes (assuming ~30 km/h average travel speed)
 * only when real coordinates yield a finite distance.
 */
export function estimateTravelEtaMinutes(distanceKm: number): number | null {
    if (!Number.isFinite(distanceKm) || distanceKm < 0) {
        return null;
    }
    if (distanceKm < 0.15) {
        return 1;
    }
    return Math.max(1, Math.round((distanceKm / 30) * 60));
}

