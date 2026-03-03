import { type UpgradeOption } from '../game/upgrades';
import Button from './Button';

interface BreakSummaryProps {
    enemiesDefeated?: number;
    goldEarned?: number;
    characterXpEarned?: number;
    upgradeOptions: UpgradeOption[];
    onUpgradeSelect: (option: UpgradeOption) => void;
    callback: () => void;
}

const BreakSummary: React.FC<BreakSummaryProps> = ({ enemiesDefeated=0, goldEarned=0, characterXpEarned=0, callback, upgradeOptions, onUpgradeSelect }) => {
    return (
        <div id="breakSummary">
            <h2>Break Summary</h2>
            <p>Enemies Defeated: {enemiesDefeated}</p>
            <p>Gold Earned: {goldEarned}</p>
            <p>XP Earned: {characterXpEarned}</p>
            <h4>Choose an Upgrade:</h4>
            {
                upgradeOptions.map((option, index) => (
                    <button key={index} onClick={() => { onUpgradeSelect(option) }}>{option.type}</button>
                ))
            }
            <hr/>
            <Button onClick={() => { callback() }}>Continue</Button>
        </div>
    );
};

export default BreakSummary;