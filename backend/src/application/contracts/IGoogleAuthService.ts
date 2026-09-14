export interface GoogleUserPayload {
    googleId: string;
    email: string;
    fullName: string;
    emailVerified: boolean;
}

export interface IGoogleAuthService {

    verifyIdToken(
        idToken: string
    ): Promise<GoogleUserPayload>;

}