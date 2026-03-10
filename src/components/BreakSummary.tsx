import { type UpgradeOption } from '../game/upgrades';
import Button from './Button';

interface BreakSummaryProps {
    enemiesDefeated?: number;
    goldEarned?: number;
    characterXpEarned?: number;
    xpEarned?: number;
    upgradeOptions: UpgradeOption[];
    projectName?: string;
    onUpgradeSelect: (option: UpgradeOption) => void;
    callback: () => void;
}
// todo - add flavor text prop

const BreakSummary: React.FC<BreakSummaryProps> = ({ enemiesDefeated=0, goldEarned=0, xpEarned=0, characterXpEarned=0, projectName="", callback, upgradeOptions, onUpgradeSelect }) => {
    return (
        <div id="breakSummary">
            <h2>{ projectName } Focus Session Complete!</h2>
            <b>The adventurer successfully explored the woods.</b>
            <p>Enemies Defeated: {enemiesDefeated}</p>
            <p>Gold Earned: {goldEarned}</p>
            <p>Character XP Earned: {characterXpEarned}</p>
            <p>You've gained { xpEarned } XP!</p>
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