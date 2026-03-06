import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, user, logout } = useAuth();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check for profile completion (firstName and lastName required)
    const isProfilePage = window.location.pathname === '/profile';
    const isProfileComplete = user?.firstName && user?.lastName;

    if (!isProfileComplete && !isProfilePage) {
        return <Navigate to="/profile" replace />;
    }

    // If specific roles are required and user doesn't have one of them
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
