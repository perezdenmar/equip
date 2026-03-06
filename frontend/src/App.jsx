import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Qualifications from './pages/Qualifications';
import Jobs from './pages/Jobs';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Trainers from './pages/Trainers';
import Students from './pages/Students';
import AdminSettings from './pages/AdminSettings';
import StaffManagement from './pages/StaffManagement';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="qualifications" element={<Qualifications />} />
                    <Route path="jobs" element={<Jobs />} />
                    <Route path="courses" element={<Courses />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="users" element={<Users />} />
                        <Route path="trainers" element={<Trainers />} />
                        <Route path="students" element={<Students />} />
                        <Route path="staff" element={<StaffManagement />} />
                        <Route path="admin/settings" element={<AdminSettings />} />
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
