import { OAuth2Client } from "google-auth-library";

import {
    GoogleUserPayload,
    IGoogleAuthService
} from "../../application/contracts/IGoogleAuthService.js";

import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";


export class GoogleAuthService implements IGoogleAuthService {

    private client: OAuth2Client;
    private readonly clientId: string;

    constructor() {

        const clientId = process.env.GOOGLE_CLIENT_ID;

        // Server configuration error
        if (!clientId) {
            throw new Error(
                "GOOGLE_CLIENT_ID is not configured"
            );
        }

        this.clientId = clientId;

        this.client = new OAuth2Client(
            this.clientId
        );
    }


    async verifyIdToken(
        idToken: string
    ): Promise<GoogleUserPayload> {

        try {

            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: this.clientId
            });

            const payload = ticket.getPayload();

            if (!payload) {
                throw new UnauthorizedError(
                    "Invalid Google token",
                    "INVALID_GOOGLE_TOKEN"
                );
            }

            if (!payload.sub) {
                throw new UnauthorizedError(
                    "Google ID not found",
                    "GOOGLE_ID_NOT_FOUND"
                );
            }

            if (!payload.email) {
                throw new UnauthorizedError(
                    "Google email not found",
                    "GOOGLE_EMAIL_NOT_FOUND"
                );
            }

            return {
                googleId: payload.sub,
                email: payload.email,
                fullName: payload.name ?? "",
                emailVerified: payload.email_verified ?? false
            };

        } catch (error) {

            // Don't replace our own application errors
            if (error instanceof UnauthorizedError) {
                throw error;
            }

            // Google token verification failed
            throw new UnauthorizedError(
                "Invalid or expired Google token",
                "INVALID_GOOGLE_TOKEN"
            );
        }
    }
}