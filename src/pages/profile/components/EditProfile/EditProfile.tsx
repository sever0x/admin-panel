import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    FormControl,
    IconButton,
    InputLabel,
    Select, SelectChangeEvent,
    TextField
} from '@mui/material';
import {CloudUpload} from '@mui/icons-material';
import {RootState} from '../../../../app/reducers';
import {updateProfile, updateProfilePhoto} from '../../actions/profileActions';
import MenuItem from 'components/MenuItem';

interface EditProfileProps {
    onCancel: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ onCancel }) => {
    const dispatch = useDispatch();
    const profile = useSelector((state: RootState) => state.profile.data);
    const [formData, setFormData] = useState(profile);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePortChange = (event: SelectChangeEvent<string[]>) => {
        const portIds = event.target.value as string[];
        const selectedPorts = portIds.reduce((acc, portId) => {
            const selectedPort = profile.portsArray.find((port: any) => port.id === portId);
            if (selectedPort) {
                acc[portId] = selectedPort;
            }
            return acc;
        }, {} as Record<string, any>);

        setFormData((prev: any) => ({
            ...prev,
            ports: selectedPorts
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(updateProfile(profile.id, formData) as any);
        onCancel();
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            try {
                const photoURL = await dispatch(updateProfilePhoto(profile.id, file) as any);
                setFormData((prev: any) => ({ ...prev, profilePhoto: photoURL }));
            } catch (error) {
                console.error('Failed to upload photo:', error);
            } finally {
                setIsUploading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
                <Box position="relative">
                    <Avatar
                        src={formData.profilePhoto}
                        alt={`${formData.firstName} ${formData.lastName}`}
                        sx={{ width: 100, height: 100, mb: 2 }}
                    />
                    <IconButton
                        sx={{ position: 'absolute', bottom: 0, right: 0 }}
                        component="label"
                        disabled={isUploading}
                    >
                        {isUploading ? <CircularProgress size={24} /> : <CloudUpload />}
                        <input
                            type="file"
                            hidden
                            onChange={handlePhotoUpload}
                            accept="image/*"
                        />
                    </IconButton>
                </Box>
            </Box>
            <TextField
                fullWidth
                margin="normal"
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
            />
            <TextField
                fullWidth
                margin="normal"
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
                <InputLabel id="ports-select-label">Ports</InputLabel>
                <Select
                    labelId="ports-select-label"
                    multiple
                    value={Object.keys(formData.ports || {})}
                    onChange={handlePortChange}
                    renderValue={(selected) => (selected).map(id => formData.ports[id].title).join(', ')}
                    variant="outlined"
                    disabled={true}
                >
                    {profile.portsArray.map((port: any) => (
                        <MenuItem key={port.id} value={port.id}>
                            {port.title}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <Box mt={3}>
                <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
                    Save
                </Button>
                <Button variant="outlined" onClick={onCancel}>
                    Cancel
                </Button>
            </Box>
        </form>
    );
};

export default EditProfile;