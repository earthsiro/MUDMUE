import { WWButton, wwTheme } from "../ww-draft.styles";
import styled, { css, keyframes } from "styled-components";
import { useCallback, useEffect, useRef, useState } from "react";

import type { DraftPhase, PhaseTimerSettings } from "../../../types/wwDraft";

const flash = keyframes`
    0%, 100% { background: ${wwTheme.accent}; color: ${wwTheme.onAccent}; }
    50% { background: ${wwTheme.surface}; color: ${wwTheme.accent}; }
`;

const Wrap = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

/** Bordered numeric box — the design's clock treatment. */
const Readout = styled.span<{ $expired: boolean; $low: boolean }>`
    font-family: ${wwTheme.fontHeading};
    font-size: 22px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    border: 2px solid ${({ $low, $expired }) => ($low || $expired ? wwTheme.accent : wwTheme.line)};
    border-radius: ${wwTheme.radiusMd};
    padding: 6px 14px;
    min-width: 88px;
    text-align: center;
    color: ${({ $low }) => ($low ? wwTheme.accent700 : wwTheme.text)};

    ${({ $expired }) =>
        $expired &&
        css`
            animation: ${flash} 0.8s steps(1, end) infinite;
        `}
`;

/** minutes configured for each phase — battle uses the optional per-attempt timer */
const phaseMinutes = (phase: DraftPhase, settings: PhaseTimerSettings): number => {
    switch (phase) {
        case "ban1":
            return settings.ban1Minutes;
        case "pick1":
            return settings.pick1Minutes;
        case "ban2":
            return settings.ban2Minutes;
        case "pick2":
            return settings.pick2Minutes;
        case "lastban":
            return settings.lastbanMinutes;
        case "bossroll":
            return settings.bossrollMinutes;
        case "battle":
            return settings.battleAttemptMinutes ?? 0;
        default:
            return 0;
    }
};

const formatClock = (totalSeconds: number) => {
    const safe = Math.max(0, totalSeconds);
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

/** Short two-tone beep via WebAudio, so no audio asset has to ship. */
const beep = () => {
    try {
        const AudioCtor =
            window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtor) return;
        const ctx = new AudioCtor();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 880;
        gain.gain.value = 0.08;
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        osc.onended = () => ctx.close();
    } catch {
        // audio is a nicety — never let it break the draft screen
    }
};

export const PhaseTimer = ({
    phase,
    settings,
    soundOn = true,
}: {
    phase: DraftPhase;
    settings: PhaseTimerSettings;
    soundOn?: boolean;
}) => {
    const duration = Math.round(phaseMinutes(phase, settings) * 60);
    const [secondsLeft, setSecondsLeft] = useState(duration);
    const [running, setRunning] = useState(duration > 0);
    /** เพิ่มค่าทุกครั้งที่ต้องเริ่มจับเวลาใหม่ (เปลี่ยนเฟส / กด Reset) */
    const [runToken, setRunToken] = useState(0);
    const alerted = useRef(false);
    /** เงาของ secondsLeft ไว้ให้ตัวนับอ่านตอนเริ่มเดิน โดยไม่ต้องผูกเป็น dependency */
    const secondsLeftRef = useRef(secondsLeft);

    useEffect(() => {
        secondsLeftRef.current = secondsLeft;
    }, [secondsLeft]);

    // one countdown per phase — entering a new phase restarts it
    useEffect(() => {
        setSecondsLeft(duration);
        setRunning(duration > 0);
        setRunToken((token) => token + 1);
        alerted.current = false;
    }, [phase, duration]);

    /**
     * นับถอยหลังจากเวลาปลายทางจริง ไม่ใช่ลบทีละ 1 ต่อ tick
     *
     * ของเดิมผูก effect ไว้กับ `secondsLeft` ด้วย ทำให้ล้างและตั้ง interval ใหม่ทุกวินาที
     * เวลาที่เสียไปกับการ render จึงบวกสะสมจนนาฬิกาเดินช้ากว่าเวลาจริง และเพี้ยนหนักขึ้น
     * อีกตอนแท็บถูกเบราว์เซอร์หรี่ความถี่ timer ลง
     */
    useEffect(() => {
        if (!running) return;
        const deadline = Date.now() + secondsLeftRef.current * 1000;
        const tick = () => setSecondsLeft(Math.max(0, Math.round((deadline - Date.now()) / 1000)));
        tick();
        const id = window.setInterval(tick, 250);
        return () => window.clearInterval(id);
    }, [running, runToken]);

    useEffect(() => {
        if (secondsLeft === 0 && duration > 0 && !alerted.current) {
            alerted.current = true;
            setRunning(false);
            if (soundOn) beep();
        }
    }, [secondsLeft, duration, soundOn]);

    const reset = useCallback(() => {
        setSecondsLeft(duration);
        secondsLeftRef.current = duration;
        alerted.current = false;
        setRunning(duration > 0);
        setRunToken((token) => token + 1);
    }, [duration]);

    if (duration <= 0) {
        return (
            <Wrap>
                <Readout $expired={false} $low={false} style={{ color: wwTheme.neutral500 }}>
                    —:—
                </Readout>
            </Wrap>
        );
    }

    return (
        <Wrap>
            <Readout $expired={secondsLeft === 0} $low={secondsLeft > 0 && secondsLeft <= 15}>
                {formatClock(secondsLeft)}
            </Readout>
            <WWButton type="button" onClick={() => setRunning((r) => !r)} disabled={secondsLeft === 0}>
                {running ? "Pause" : "Start"}
            </WWButton>
            <WWButton type="button" onClick={reset}>
                Reset
            </WWButton>
        </Wrap>
    );
};
