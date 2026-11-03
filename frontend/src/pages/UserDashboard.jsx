import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

const UserDashboard = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-5">
                <h2>User Dashboard</h2>
                <LogoutButton />
            </div>

            <div className="card shadow-sm p-4">

                <div className="d-flex align-items-center gap-4 flex-wrap">

                    <img
                        src={
                            user?.profileImage ||
                            'https://placehold.co/120x120?text=User'
                        }
                        alt="Profile"
                        className="rounded-circle"
                        style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover'
                        }}
                    />

                    <div>
                        <h3>Welcome, {user?.name}!</h3>
                        <p className="text-muted mb-1">{user?.email}</p>
                        <span className="badge bg-primary">User</span>
                    </div>

                </div>

                <hr />

                <h5>Quick Actions</h5>

                <div className="d-flex gap-3 flex-wrap mt-3">

                    <Link to="/profile" className="btn btn-primary">
                        Manage Profile
                    </Link>

                </div>

            </div>

        </div>
    );
};

export default UserDashboard;