import React from 'react';

type BossMeterProps = {
    progress: number; // 0..total-1
    total?: number; // default every 4 pomodoros
};

export default function BossMeter({ progress, total = 4 }: BossMeterProps) {
    
    return (
        <div aria-label="Boss fight progress" className="boss-meter">
            {
                Array.from({ length: total }).map((_, index) => (
                    <span key={index} style={{ opacity: index < progress ? 1 : 0.35 }}>
                        ⚔️
                    </span>
                ))
            }
        </div>
    );
}