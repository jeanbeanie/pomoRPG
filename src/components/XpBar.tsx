interface XpBarProps {
    xp: number;
    xpPerLevel?: number;
}

const XpBar: React.FC<XpBarProps> = ({ xp, xpPerLevel = 100 }) => {
    const progress = xp % xpPerLevel;
    const percent = (progress / xpPerLevel) * 100;

    return (
        <div className="xp-bar-container">
            
            <div
                className="xp-bar-fill-area"
                style={{ width: `${percent}%` }}
            />
            <div className="xp-bar-text-area">{progress} / {xpPerLevel}</div>
        </div>
    );
};

export default XpBar;