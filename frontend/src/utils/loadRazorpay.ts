export interface RazorpayPaymentSuccessResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface RazorpayPaymentFailedResponse {
    error?: {
        code?: string;
        description?: string;
        source?: string;
        step?: string;
        reason?: string;
        metadata?: {
            order_id?: string;
            payment_id?: string;
        };
    };
}

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: RazorpayPaymentSuccessResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

export interface RazorpayInstance {
    open: () => void;
    on: (
        event: "payment.failed",
        callback: (response: RazorpayPaymentFailedResponse) => void
    ) => void;
}

export type RazorpayConstructor = new (
    options: RazorpayCheckoutOptions
) => RazorpayInstance;

interface WindowWithRazorpay extends Window {
    Razorpay?: RazorpayConstructor;
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let loadingPromise: Promise<boolean> | null = null;

export function getRazorpayConstructor(): RazorpayConstructor | undefined {
    if (typeof window === "undefined") {
        return undefined;
    }
    return (window as WindowWithRazorpay).Razorpay;
}

export function loadRazorpayScript(): Promise<boolean> {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return Promise.resolve(false);
    }

    if (getRazorpayConstructor()) {
        return Promise.resolve(true);
    }

    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = new Promise<boolean>((resolve) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
            `script[src="${RAZORPAY_SCRIPT_SRC}"]`
        );

        if (existingScript) {
            existingScript.addEventListener("load", () => resolve(true), {
                once: true,
            });
            existingScript.addEventListener(
                "error",
                () => {
                    loadingPromise = null;
                    resolve(false);
                },
                { once: true }
            );
            return;
        }

        const script = document.createElement("script");
        script.src = RAZORPAY_SCRIPT_SRC;
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => {
            loadingPromise = null;
            resolve(false);
        };

        document.body.appendChild(script);
    });

    return loadingPromise;
}

