import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Main/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import EditorSignup from './pages/Auth/EditorSignup';
import ClientSignup from './pages/Auth/ClientSignup';
import Login from './pages/Auth/Login';
import AdminAnalytics from './pages/Admin/Analytics';
import BrowseEditors from './pages/Client/BrowseEditors';
import EditorProfile from './pages/Client/EditorProfile';
import CreateRequest from './pages/Client/CreateRequest';
import EditRequest from './pages/Client/EditRequest';
import MyRequests from './pages/Client/MyRequests';
import ClientRequestDetails from './pages/Client/RequestDetails';
import ClientDashboard from './pages/Client/ClientDashboard';
import PaymentPage from './pages/Client/PaymentPage';
import RequestsReceived from './pages/Editor/RequestsReceived';
import RequestDetails from './pages/Editor/RequestDetails';
import NegotiateRequest from './pages/Editor/NegotiateRequest';
import EditProfile from './pages/Editor/EditProfile';
import UploadDeliverable from './pages/Editor/UploadDeliverable';
import EditorDashboard from './pages/Editor/EditorDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppLayout() {
  const location = useLocation();
  const NO_FOOTER = ['/login', '/signup/client', '/signup/editor', '/client/pay'];
  const showFooter = !NO_FOOTER.some(path => location.pathname.startsWith(path));

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup/editor" element={<EditorSignup />} />
        <Route path="/signup/client" element={<ClientSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/client/browse" element={<BrowseEditors />} />
        <Route path="/client/editor/:id" element={<EditorProfile />} />

        <Route path="/client/create-request" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><CreateRequest /></ProtectedRoute>
        } />

        <Route path="/client/dashboard" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><ClientDashboard /></ProtectedRoute>
        } />

        <Route path="/client/requests" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><MyRequests /></ProtectedRoute>
        } />

        <Route path="/client/request/:id" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><ClientRequestDetails /></ProtectedRoute>
        } />

        <Route path="/client/request/:id/edit" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><EditRequest /></ProtectedRoute>
        } />

        <Route path="/client/pay/:id" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><PaymentPage /></ProtectedRoute>
        } />

        <Route path="/editor/dashboard" element={
          <ProtectedRoute allowedRoles={['EDITOR']}><EditorDashboard /></ProtectedRoute>
        } />

        <Route path="/editor/work-requests" element={
          <ProtectedRoute allowedRoles={['EDITOR']}><RequestsReceived /></ProtectedRoute>
        } />

        <Route path="/editor/request/:id" element={
          <ProtectedRoute allowedRoles={['EDITOR']}><RequestDetails /></ProtectedRoute>
        } />

        <Route path="/editor/negotiate/:id" element={
          <ProtectedRoute allowedRoles={['EDITOR']}><NegotiateRequest /></ProtectedRoute>
        } />

        <Route path="/editor/edit-profile" element={
          <ProtectedRoute allowedRoles={['EDITOR']}><EditProfile /></ProtectedRoute>
        } />

        <Route path="/editor/deliverables" element={
          <ProtectedRoute allowedRoles={['EDITOR']}><UploadDeliverable /></ProtectedRoute>
        } />

        <Route path="/client/deliverables" element={
          <ProtectedRoute allowedRoles={['CLIENT']}><UploadDeliverable /></ProtectedRoute>
        } />

        <Route path="/admin/analytics" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>
        } />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}