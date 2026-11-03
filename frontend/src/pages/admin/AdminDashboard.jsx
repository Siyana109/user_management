import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import api from '../../services/api';
import LogoutButton from '../../components/LogoutButton';

const AdminDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    const [formErrors, setFormErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters.';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!editId) {
            if (!formData.password) {
                newErrors.password = 'Password is required.';
            } else if (formData.password.length < 6) {
                newErrors.password = 'Password must be at least 6 characters.';
            }
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

    // Fetch Users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/users');

            setUsers(response.data.users);

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Search Users
    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearch(value);

        try {
            setLoading(true);

            if (!value.trim()) {
                const response = await api.get('/admin/users');
                setUsers(response.data.users);
            } else {
                const response = await api.get(
                    `/admin/users/search?query=${encodeURIComponent(value)}`
                );

                setUsers(response.data.users);
            }

            setError('');

        } catch (error) {
            setError(error.response?.data?.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    // Open Add Form
    const handleAdd = () => {
        setEditId(null);

        setFormData({
            name: '',
            email: '',
            password: '',
            phone: ''
        });

        setShowForm(true);
    };

    // Open Edit Form
    const handleEdit = (user) => {
        setEditId(user._id);

        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            phone: user.phone || ''
        });

        setShowForm(true);
    };

    // Handle Input
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });

        // Clear error for the field being edited
        if (formErrors[e.target.name]) {
            setFormErrors({ ...formErrors, [e.target.name]: '' });
        }
    };

    // Add / Edit User
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFormErrors(validationErrors);
            return;
        }

        try {
            setLoading(true);
            setError('');
            setFormErrors({});

            if (editId) {
                await api.put(`/admin/users/${editId}`, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone
                });
            } else {
                await api.post('/admin/users', formData);
            }

            setShowForm(false);
            setSearch('');
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: ''
            });

            await fetchUsers();

        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    // Delete User
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this user?'
        );

        if (!confirmDelete) return;

        try {
            setLoading(true);
            setError('');

            await api.delete(`/admin/users/${id}`);

            await fetchUsers();

        } catch (error) {
            setError(error.response?.data?.message || 'Delete failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 px-3 px-md-5">

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">

                <div>
                    <h2>Admin Dashboard</h2>
                    <p className="text-muted mb-0">
                        Welcome, {user?.name}
                    </p>
                </div>

                <LogoutButton />

            </div>

            {/* Statistics */}
            <div className="row mb-4">

                <div className="col-md-4">
                    <div className="card shadow-sm p-3">
                        <h6>Total Users</h6>
                        <h2>{users.length}</h2>
                    </div>
                </div>

            </div>

            {/* User Management */}
            <div className="card shadow-sm p-3">

                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">

                    <h4>User Management</h4>

                    <button
                        className="btn btn-primary"
                        onClick={handleAdd}
                    >
                        + Add User
                    </button>

                </div>

                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={handleSearch}
                />

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {loading && (
                    <p className="text-center">Loading...</p>
                )}

                {/* Add / Edit Form */}
                {showForm && (

                    <form
                        onSubmit={handleSubmit}
                        className="border rounded p-3 mb-4"
                        noValidate
                    >

                        <h5>{editId ? 'Edit User' : 'Add User'}</h5>

                        <div className="mb-2">
                            <input
                                type="text"
                                name="name"
                                className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {formErrors.name && (
                                <div className="invalid-feedback">{formErrors.name}</div>
                            )}
                        </div>

                        <div className="mb-2">
                            <input
                                type="email"
                                name="email"
                                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {formErrors.email && (
                                <div className="invalid-feedback">{formErrors.email}</div>
                            )}
                        </div>

                        {!editId && (
                            <div className="mb-2">
                                <input
                                    type="password"
                                    name="password"
                                    className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {formErrors.password && (
                                    <div className="invalid-feedback">{formErrors.password}</div>
                                )}
                            </div>
                        )}

                        <div className="mb-3">
                            <input
                                type="tel"
                                name="phone"
                                className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                                placeholder="Phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            {formErrors.phone && (
                                <div className="invalid-feedback">{formErrors.phone}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success me-2"
                            disabled={loading}
                        >
                            {editId ? 'Update User' : 'Add User'}
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>

                    </form>

                )}

                {/* Users Table */}
                <div className="table-responsive">

                    <table className="table table-hover align-middle">

                        <thead className="table-dark">
                            <tr>
                                <th>Profile</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>

                            {!loading && users.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4">
                                        No users found
                                    </td>
                                </tr>
                            )}

                            {users.map((item) => (

                                <tr key={item._id}>

                                    <td>
                                        <img
                                            src={
                                                item.profileImage ||
                                                'https://placehold.co/45x45?text=U'
                                            }
                                            alt="User"
                                            className="rounded-circle"
                                            width="45"
                                            height="45"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </td>

                                    <td>{item.name}</td>

                                    <td>{item.email}</td>

                                    <td>{item.phone || '-'}</td>

                                    <td>
                                        <button
                                            className="btn btn-sm btn-warning me-2 mb-1"
                                            onClick={() => handleEdit(item)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-sm btn-danger mb-1"
                                            onClick={() => handleDelete(item._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default AdminDashboard;