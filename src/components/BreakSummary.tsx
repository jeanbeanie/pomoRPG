// src/components/BreakSummary.tsx

import { type UpgradeOption } from '../game/upgrades';
import Button from './Button';
import { type BossFightResult } from '../game/bosses';

interface BreakSummaryProps {
    bossResult?: BossFightResult;

    enemiesDefeated?: number;
    goldEarned?: number;
    characterXpEarned?: number;

    xpEarned?: number;
    cleanBonusXp?: number;

    upgradeOptions: UpgradeOption[];
    projectName?: string;

    onUpgradeSelect: (option: UpgradeOption) => void;
    selectedOption?: UpgradeOption;
    // todo: improve callback name, maybe onContinue or something
    callback: () => void;
    breakLocked?: boolean;
}

const BreakSummary: React.FC<BreakSummaryProps> = ({
    bossResult,
    enemiesDefeated = 0,
    goldEarned = 0,
    xpEarned = 0,
    cleanBonusXp = 0,
    characterXpEarned = 0,
    projectName = "",
    callback,
    upgradeOptions,
    onUpgradeSelect,
    selectedOption = null,
    breakLocked = false,
}) => {
    return (
        <div id="breakSummary">
            <h2>{projectName} Focus Session Complete!</h2>
            <hr />

            <p>XP Earned: +{xpEarned}</p>
            {cleanBonusXp > 0 && (
                <small style={{ opacity: 0.85 }}>Clean run bonus: +{cleanBonusXp} XP</small>
            )}

            <p>The adventurer successfully explored the woods.</p>
            <b>Character Run:</b>
            <p>Enemies Defeated: {enemiesDefeated}</p>
            <p>Gold Earned: {goldEarned}</p>
            <p>Character XP Earned: {characterXpEarned}</p>

            {bossResult && (
                <>
                    <hr />
                    <h3>Boss Ambush: {bossResult.boss.name}</h3>
                    <p>
                        You strike for <b>{bossResult.playerDamage.toFixed(2)}</b> •{" "}
                        {bossResult.boss.name} strikes for <b>{bossResult.bossDamage.toFixed(2)}</b>
                    </p>
                    <p>
                        Clash: <b>{bossResult.playerDamage.toFixed(2)}</b> vs{" "}
                        <b>{bossResult.bossDamage.toFixed(2)}</b>
                    </p>

                    {bossResult.victory ? (
                        <p>Victory! {bossResult.boss.name} staggers back into the darkness!</p>
                    ) : (
                        <p>Defeat! {bossResult.boss.name} remains undefeated!</p>
                    )}
                </>
            )}

            <hr />
            <b>Choose an Upgrade:</b>
            {upgradeOptions.map((option, index) => (
                <Button
                    key={index}
                    className={selectedOption === option ? "selected" : ""}
                    onClick={() => onUpgradeSelect(option)}
                >
                    {option.type}
                </Button>
            ))}

            <hr />
            <Button onClick={callback} disabled={breakLocked}>
                Continue
            </Button>
            {breakLocked && <small style={{ opacity: 0.8 }}>Break in progress…</small>}
        </div>
    );
};

export default BreakSummary;