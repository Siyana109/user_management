import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { setCredentials } from '../redux/authSlice';
import LogoutButton from '../components/LogoutButton';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const validateProfile = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required.';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        }

        if (formData.phone) {
            const digits = formData.phone.replace(/[\s\-+().]/g, '');
            if (!/^\d+$/.test(digits)) {
                newErrors.phone = 'Phone number must contain only digits and valid characters (spaces, +, -, parentheses).';
            } else if (digits.length !== 10) {
                newErrors.phone = 'Phone number must be exactly 10 digits.';
            }
        }

        return newErrors;
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: '' });
        }
    };

    // Update Profile
    const handleUpdate = async (e) => {
        e.preventDefault();

        const validationErrors = validateProfile();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            setError('');
            setMessage('');
            setFormErrors({});

            const response = await api.put('/user/profile', formData);

            dispatch(setCredentials(response.data.user));

            setMessage('Profile updated successfully');

        } catch (error) {
            setError(error.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    // Validate and set image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageError('');

        if (!file) {
            setImage(null);
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setImageError('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
            setImage(null);
            e.target.value = '';
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            setImageError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 5 MB.`);
            setImage(null);
            e.target.value = '';
            return;
        }

        setImage(file);
    };

    // Upload Profile Image
    const handleImageUpload = async () => {
        if (!image) {
            setImageError('Please select an image before uploading.');
            return;
        }

        const data = new FormData();
        data.append('profileImage', image);

        try {
            setLoading(true);
            setImageError('');
            setMessage('');

            const response = await api.post('/user/profile/image', data);

            dispatch(setCredentials({
                ...user,
                profileImage: response.data.profileImage
            }));

            setImage(null);
            setMessage('Profile image uploaded successfully');

        } catch (error) {
            setImageError(error.response?.data?.message || 'Image upload failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <p className="text-center mt-5">Loading profile...</p>;
    }

    return (
        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Profile</h2>

                <LogoutButton />
            </div>

            <div className="card shadow-sm p-4 mx-auto" style={{ maxWidth: '650px' }}>

                {message && (
                    <div className="alert alert-success">{message}</div>
                )}

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {/* Profile Image */}
                <div className="text-center mb-4">

                    <img
                        src={
                            user.profileImage ||
                            'https://placehold.co/150x150?text=User'
                        }
                        alt="Profile"
                        className="rounded-circle mb-3"
                        style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover'
                        }}
                    />

                    <div>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className={`form-control ${imageError ? 'is-invalid' : ''}`}
                            onChange={handleImageChange}
                        />
                        {imageError && (
                            <div className="invalid-feedback d-block">{imageError}</div>
                        )}
                        <small className="text-muted">Allowed: JPG, PNG, WebP &mdash; Max size: 5 MB</small>
                    </div>

                    <button
                        className="btn btn-outline-primary mt-3"
                        onClick={handleImageUpload}
                        disabled={loading || !image}
                    >
                        {loading ? 'Uploading...' : 'Upload Image'}
                    </button>

                </div>

                <hr />

                {/* Profile Details */}
                <form onSubmit={handleUpdate} noValidate>

                    <div className="mb-3">
                        <label className="form-label">Full Name</label>

                        <input
                            type="text"
                            name="name"
                            className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                            value={formData.name}
                            onChange={handleChange}
                        />
                        {formErrors.name && (
                            <div className="invalid-feedback">{formErrors.name}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email Address</label>

                        <input
                            type="email"
                            className="form-control"
                            value={user.email}
                            disabled
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Phone Number</label>

                        <input
                            type="tel"
                            name="phone"
                            className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                            value={formData.phone}
                            onChange={handleChange}
                        />
                        {formErrors.phone && (
                            <div className="invalid-feedback">{formErrors.phone}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Update Profile'}
                    </button>

                </form>

                <button
                    className="btn btn-secondary w-100 mt-3"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>

            </div>

        </div>
    );
};

export default Profile;