interface XpDisplayProps {
    xp: number; // current XP
}

const XpDisplay: React.FC<XpDisplayProps> = ({ xp }) => {
    return (
        <h3>XP: {xp}</h3>
    );
};

export default XpDisplay;