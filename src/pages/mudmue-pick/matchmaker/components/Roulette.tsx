import React, { useEffect, useState } from "react";

interface RouletteColumnProps {
    targetIndex: number; // ชื่อที่จะหยุดที่ไหนใน original players
    spinning: boolean;
    isClear: boolean;
    onStop?: () => void;
    players: string[];
}

export const Roulette: React.FC<RouletteColumnProps> = ({
    targetIndex,
    spinning,
    isClear,
    onStop,
    players = [],
}) => {
    const [offset, setOffset] = useState(0);
    const [transition, setTransition] = useState("none");

    const REPEAT_TIMES = 50;
    const extendedPlayers = Array(REPEAT_TIMES + 2)
        .fill(players)
        .flat();
    useEffect(() => {
        if (spinning) {
            const finalOffset = (REPEAT_TIMES * players.length + targetIndex - 1) * 100;
            setTransition("transform 3s ease-out");
            setOffset(finalOffset);

            const timer = setTimeout(() => {
                if (onStop) onStop();
            }, 3000); // 3s ตาม transition

            return () => clearTimeout(timer);
        }
    }, [spinning, targetIndex, onStop, players.length]);

    useEffect(() => {
        if (isClear) {
            setTransition("none");
            setOffset((2 * players.length + targetIndex - 1) * 100); // รีเซ็ต offset เมื่อ isClear เป็น true ไปยัง targetIndex ล่าสุด
        }
    }, [isClear]);

    return (
        <div className="roulette">
            <div
                className="roulette-strip"
                style={{
                    transform: `translateY(-${offset}px)`,
                    transition,
                }}
            >
                {extendedPlayers.map((name, idx) => (
                    <div className="item" key={idx}>
                        {name}
                    </div>
                ))}
            </div>
        </div>
    );
};
