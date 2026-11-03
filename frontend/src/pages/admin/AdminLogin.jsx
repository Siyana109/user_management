import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin, clearError } from '../../redux/authSlice';

const AdminLogin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required.';
        }

        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Clear the specific field error on change
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }

        dispatch(clearError());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const admin = await dispatch(loginAdmin(formData)).unwrap();

            if (admin.role === 'admin') {
                navigate('/admin/dashboard');
            }

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">

            <div className="card shadow p-4" style={{ width: '420px' }}>

                <h2 className="text-center mb-4">Admin Login</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} noValidate>

                    <div className="mb-3">
                        <input
                            type="email"
                            name="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Admin Email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            name="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && (
                            <div className="invalid-feedback">{errors.password}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-dark w-100"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Admin Login'}
                    </button>

                </form>

                <p className="text-center mt-3">
                    <Link to="/login">Back to User Login</Link>
                </p>

            </div>

        </div>
    );
};

export default AdminLogin;