import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../redux/authSlice';

const LogoutButton = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            navigate('/login');
        } catch (error) {
            alert(error);
        }
    };

    return (
        <button
            className="btn btn-danger"
            onClick={handleLogout}
        >
            Logout
        </button>
    );
};

export default LogoutButton;