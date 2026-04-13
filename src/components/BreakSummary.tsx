// src/components/BreakSummary.tsx

import { type UpgradeOption } from '../game/upgrades';
import Button from './Button';
import { type Boss } from '../game/bosses';

interface BreakSummaryProps {
    bossResult?: { boss: Boss, victory: boolean };
    enemiesDefeated?: number;
    goldEarned?: number;
    characterXpEarned?: number;
    xpEarned?: number;
    upgradeOptions: UpgradeOption[];
    projectName?: string;
    onUpgradeSelect: (option: UpgradeOption) => void;
    selectedOption?: UpgradeOption;
    callback: () => void;
    breakLocked?: boolean;
}
// todo - add flavor text prop

const BreakSummary: React.FC<BreakSummaryProps> = ({ bossResult, enemiesDefeated = 0, goldEarned = 0, xpEarned = 0, characterXpEarned = 0, projectName = "", callback, upgradeOptions, onUpgradeSelect, selectedOption = null }) => {
    return bossResult ? (
        <div>
            <h2>Boss Battle : {bossResult.boss.name}</h2>
            {
                bossResult.victory ?
                    (<p>Yay</p>) : (<p>Nooo</p>)
            }
            <b>Choose an Upgrade:</b>
            {
                upgradeOptions.map((option, index) => (
                    <Button
                        key={index}
                        className={selectedOption === option ? "selected" : ""}
                        onClick={() => { onUpgradeSelect(option) }}
                    >
                        {option.type}
                    </Button>
                ))
            }
            <Button onClick={() => { callback() }}>Continue</Button>
        </div>
        ) : (
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
                    <Button
                        key={index}
                        className={ selectedOption === option ? "selected" : ""}
                        onClick={() => { onUpgradeSelect(option) }}
                    >
                        {option.type}
                    </Button>
                ))
            }
            <hr />
            <Button onClick={() => { callback() }}>Continue</Button>
        </div>
    );
};

export default BreakSummary;