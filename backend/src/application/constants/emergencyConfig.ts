export const DEFAULT_EMERGENCY_LOCATION_FRESHNESS_MINUTES = 60;
export const EMERGENCY_PRIMARY_RADIUS_KM = 5;
export const EMERGENCY_FALLBACK_RADIUS_KM = 10;

export function getEmergencyLocationFreshnessMinutes(): number {
    const raw = Number(process.env.EMERGENCY_LOCATION_FRESHNESS_MINUTES);
    if (!Number.isFinite(raw) || raw <= 0) {
        return DEFAULT_EMERGENCY_LOCATION_FRESHNESS_MINUTES;
    }
    return raw;
}

export interface WebRtcIceServerConfig {
    urls: string | string[];
    username?: string;
    credential?: string;
}

export function getWebRtcIceServers(): {
    iceServers: WebRtcIceServerConfig[];
    hasTurnServer: boolean;
} {
    const rawJson = process.env.WEBRTC_ICE_SERVERS_JSON?.trim();
    if (rawJson) {
        try {
            const parsed = JSON.parse(rawJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const valid = parsed.filter(
                    (entry): entry is WebRtcIceServerConfig =>
                        Boolean(
                            entry &&
                                typeof entry === "object" &&
                                (typeof entry.urls === "string" ||
                                    Array.isArray(entry.urls))
                        )
                );
                if (valid.length > 0) {
                    const hasTurn = valid.some((entry) => {
                        const list = Array.isArray(entry.urls)
                            ? entry.urls
                            : [entry.urls];
                        return list.some((url) =>
                            /^turns?:/i.test(String(url))
                        );
                    });
                    return { iceServers: valid, hasTurnServer: hasTurn };
                }
            }
        } catch {
            // Fall through to structured env vars or default STUN
        }
    }

    const iceServers: WebRtcIceServerConfig[] = [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
            ],
        },
    ];

    let hasTurnServer = false;
    const turnUrl = process.env.TURN_SERVER_URL?.trim();
    if (turnUrl) {
        const turnUsername = process.env.TURN_USERNAME?.trim();
        const turnCredential = process.env.TURN_CREDENTIAL?.trim();
        iceServers.push({
            urls: turnUrl,
            ...(turnUsername ? { username: turnUsername } : {}),
            ...(turnCredential ? { credential: turnCredential } : {}),
        });
        hasTurnServer = true;
    }

    return { iceServers, hasTurnServer };
}

