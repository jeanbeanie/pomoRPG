// src/utils/alerts.ts
// Real end-of-session alerts: a synthesized chime (Web Audio) plus an
// optional OS-level Notification, as a more reliable signal than the
// document-title flash alone.

let audioCtx: AudioContext | null = null;

// Must be called from inside a user-gesture handler (e.g. a checkbox
// onChange) so the browser's autoplay policy allows the context to run.
// The resumed context stays usable later when playChime() is called from
// a non-gesture context (the session-complete effect).
export function unlockAudio(): void {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === "suspended") {
        void audioCtx.resume();
    }
}

export function playChime(): void {
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const beepDuration = 0.15;
    const gap = 0.1;
    const beepCount = 3;

    for (let i = 0; i < beepCount; i++) {
        const start = now + i * (beepDuration + gap);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.5, start + 0.01);
        gain.gain.setValueAtTime(0.5, start + beepDuration - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + beepDuration);
        gain.connect(audioCtx.destination);

        const osc = audioCtx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 1000;
        osc.connect(gain);
        osc.start(start);
        osc.stop(start + beepDuration);
    }
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;

    const result = await Notification.requestPermission();
    return result === "granted";
}

export function notifySessionEnd(body: string): void {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    if (!document.hidden) return;

    const notification = new Notification("⏰ Session complete!", {
        body,
        icon: "/pomoRPG/pwa-192.png",
        tag: "pomorpg-session-end",
    });

    notification.onclick = () => {
        window.focus();
        notification.close();
    };
}
