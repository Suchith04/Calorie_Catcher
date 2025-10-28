import React from 'react'
import { isLoggedin } from '../utils/auth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}) =>{
    return isLoggedin()? children :<Navigate to="/login"/>;
}

export default ProtectedRoute;