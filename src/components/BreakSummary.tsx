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
// todo - add flavor text prop

const BreakSummary: React.FC<BreakSummaryProps> = ({ enemiesDefeated=0, goldEarned=0, characterXpEarned=0, callback, upgradeOptions, onUpgradeSelect }) => {
    return (
        <div id="breakSummary">
            <h2>Break Time Summary</h2>
            <p>The adventurer finished exploring the woods.</p>
            <p>Enemies Defeated: {enemiesDefeated}</p>
            <p>Gold Earned: {goldEarned}</p>
            <p>XP Earned: {characterXpEarned}</p>
            <h4>Choose an Upgrade:</h4>
            {
                upgradeOptions.map((option, index) => (
                    <Button key={index} onClick={() => { onUpgradeSelect(option) }}>{option.type}</Button>
                ))
            }
            <hr/>
            <Button onClick={() => { callback() }}>Continue</Button>
        </div>
    );
};

export default BreakSummary;