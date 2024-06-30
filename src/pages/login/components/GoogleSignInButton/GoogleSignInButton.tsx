import React from 'react';
import Button from 'components/Button';

interface GoogleSignInButtonProps {
    onClick: () => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onClick }) => (
    <Button
        type="button"
        fullWidth
        variant="outlined"
        onClick={onClick}
        startIcon={<img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google Icon" />}
        sx={{
            borderColor: '#000',
            color: '#000',
            borderRadius: '16px',
            textTransform: 'none',
            padding: '10px 0',
            '&:hover': {
                borderColor: '#333',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
        }}
    >
        Sign In with Google
    </Button>
);

export default GoogleSignInButton;