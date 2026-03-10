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
            <h2>{projectName} Focus Session Complete!</h2>
            <hr />
            <p>XP Earned: +{xpEarned}</p>
            
            <p>The adventurer successfully explored the woods.</p>
            <b>Character Run:</b>
            <p>Enemies Defeated: {enemiesDefeated}</p>
            <p>Gold Earned: {goldEarned}</p>
            <p>Character XP Earned: {characterXpEarned}</p>
            
            <b>Choose an Upgrade:</b>
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