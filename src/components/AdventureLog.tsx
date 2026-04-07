// src/components/AdventureLog.tsx
import { useMemo, useState } from 'react';
import { loadAdventureLog } from '../game/adventureLog';

export default function AdventureLog() {
    const [expanded, setExpanded] = useState(false);

    // useMemo to load the log only once when the component mounts
    const entries = useMemo(() => loadAdventureLog(), []);

    const visibleCount = expanded ? 10 : 1;
    const visibleEntries = entries.slice(0, visibleCount);

    return (
        <div>
            <div className="adventure-log-header">
                <h2 className="adventure-log-title">Adventure Log  </h2>
                 <button
                    className="btn adventure-log-toggle"
                    onClick={() => setExpanded((prev) => !prev)}
                    disabled={entries.length <= 1}
                    aria-expanded={expanded}
                    aria-aria-label={expanded ? "Collapse adventure log" : "Expand adventure log"}
                >
                    {expanded ? "▴" : "▾"}
                </button>
            </div>

            {entries.length === 0 ? (<p>No adventures to log yet - finish a focus session first!</p>) :
                (visibleEntries.map(entry => (
                    <p key={entry.id}>
                        {entry.text}
                    </p>
                )))
            }

            {expanded && entries.length > 10 && (
                <small style={{ opacity: 0.7 }}>
                    Showing 10 of {entries.length}
                </small>
            )}
        </div>
    )
}