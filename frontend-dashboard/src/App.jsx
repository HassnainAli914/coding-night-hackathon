import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';

import './charts/ChartjsConfig';

// Import pages
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Checkout from './pages/Checkout';
import Settings from './pages/Settings';
import Assets from './pages/Assets';
import Issues from './pages/Issues';
import ReportIssue from './pages/ReportIssue';
import AssetDetails from './pages/AssetDetails';
import PublicAsset from './pages/PublicAsset';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TechnicianConsole from './pages/TechnicianConsole';
import MaintenanceRecords from './pages/MaintenanceRecords';
import PrivateRoute from './components/PrivateRoute';

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]); // triggered on route change

  return (
    <>
      <Routes>
        <Route exact path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'client', 'reporter', 'student', 'teacher']}>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/analytics" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'teacher']}>
            <AnalyticsDashboard />
          </PrivateRoute>
        } />
        <Route path="/technician" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'teacher']}>
            <TechnicianConsole />
          </PrivateRoute>
        } />
        <Route path="/maintenance" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'teacher']}>
            <MaintenanceRecords />
          </PrivateRoute>
        } />
        <Route path="/assets" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'teacher']}>
            <Assets />
          </PrivateRoute>
        } />
        <Route path="/issues" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'teacher']}>
            <Issues />
          </PrivateRoute>
        } />
        <Route path="/report-issue" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'client', 'reporter', 'student', 'teacher']}>
            <ReportIssue />
          </PrivateRoute>
        } />
        <Route path="/assets/:id" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'teacher']}>
            <AssetDetails />
          </PrivateRoute>
        } />
        <Route path="/public/asset/:id" element={<PublicAsset />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/settings" element={
          <PrivateRoute allowedRoles={['admin', 'technician', 'worker', 'client', 'reporter', 'student', 'teacher']}>
            <Settings />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

export default App;

