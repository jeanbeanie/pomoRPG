import { type UpgradeOption } from '../game/upgrades';

interface BreakSummaryProps {
    enemiesDefeated?: number;
    goldEarned?: number;
    characterXpEarned?: number;
    upgradeOptions: UpgradeOption[];
    onUpgradeSelected: (option: UpgradeOption) => void;
    callback: () => void;
}

const BreakSummary: React.FC<BreakSummaryProps> = ({ enemiesDefeated=0, goldEarned=0, characterXpEarned=0, callback }) => {
    return (
        <div id="breakSummary">
            <h2>Break Summary</h2>
            <p>Enemies Defeated: {enemiesDefeated}</p>
            <p>Gold Earned: {goldEarned}</p>
            <p>XP Earned: {characterXpEarned}</p>
            <button onClick={() => { callback() }}>Continue</button>
        </div>
    );
};

export default BreakSummary;