import { jwtDecode } from "jwt-decode";
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.role !== 'admin') {
            return <Navigate to="/home" replace />;
        }
        return children;

    } catch (error) {
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute;