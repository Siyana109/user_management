import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
    const { user, isAuthenticated, checkingAuth } = useSelector(
        (state) => state.auth
    );

    if (checkingAuth) {
        return <div className="text-center mt-5">Checking authentication...</div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/admin/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;