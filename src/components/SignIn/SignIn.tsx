import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {TextField, Button, Container, Typography} from '@mui/material';
import useAuth from '../../misc/hooks/useAuth';

const SignIn = () => {
    const {login, error} = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await login(email, password);
        navigate('/profile');
    };

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>Sign In</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <Typography color="error">{error.message}</Typography>}
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Sign In
                </Button>
            </form>
        </Container>
    );
};

export default SignIn;