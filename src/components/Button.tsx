//custom button component
interface ButtonProps {
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, children }) => {
    return (
        <button onClick={onClick} disabled={disabled} className="btn">
            {children}
        </button>
    );
};

export default Button;