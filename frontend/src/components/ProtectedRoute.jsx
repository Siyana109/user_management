import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = () => {
    const { user, isAuthenticated, checkingAuth } = useSelector(
        (state) => state.auth
    );

    if (checkingAuth) {
        return <div className="text-center mt-5">Checking authentication...</div>;
    }

    if (!isAuthenticated || !user || user.role !== 'user') {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;