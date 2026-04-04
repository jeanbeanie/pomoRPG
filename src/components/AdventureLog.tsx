// src/components/AdventureLog.tsx

import { loadAdventureLog } from '../game/adventureLog';

export default function AdventureLog() {
    const entries = loadAdventureLog();

    return (
        <div>
            <h2>Adventure Log</h2>

            {entries.slice(0, 10).map(entry => (
                <p key={entry.id}>
                    {entry.text}
                </p>
            ))}
        </div>
    )
}