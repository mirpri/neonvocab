
export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

export interface UserInfo {
    username: string;
    nickname: string;
    avatarUrl: string;
}

const API_BASE_URL = "https://mirpass-api.puppygoapp.com";

export async function exchangeCodeForToken(
    code: string,
    verifier: string
): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            client_id: "Zm0kyCXZ4pSr-be6TZAhj",
            code,
            code_verifier: verifier,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch(`${API_BASE_URL}/myprofile`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const json = await response.json();
    return json.data;
}

export function generateCodeVerifier() {
    const randomBytes = new Uint8Array(43);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

export async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

export function generateState() {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}