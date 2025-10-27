import React from 'react';
import {useState} from 'react';
import "./Auth.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {

    const [data,setData] = useState({email:"",
        password:""
    });
    const [errorMsg,setError] = useState();
    const navigate = useNavigate();

    const handleChange = (e) =>{
        const {name,value} = e.target;
        setData((prevData) => ({
            ...prevData,[name]:value,
        }));
    }

    const handleLogin = async(e) =>{
        e.preventDefault();
        console.log("Get The JWT Bearer Token");

        axios.post("http://localhost:5000/login",data)
        .then((res) =>{
            if(res.data.token){
                localStorage.setItem('token',res.data.token);
                navigate('/');
            }
        })
        .catch((err)=>{
            setError("Login Failed");
            console.log(err);
        })
    }

  return (
    <div className='main'>
        <h3>Login</h3>
        <form onSubmit={handleLogin}>

            <div className='input'>
                <label htmlFor='email'>Email</label>
                <input type='email' name='email' placeholder='Enter Your Email' onChange={handleChange} />
            </div>
            <div className='input'>
                <label htmlFor='password'>Password</label>
                <input type='password' name='password' placeholder='Password' onChange={handleChange} />
            </div>
            

            <button className="login-btn" type='submit'>Login</button>
            {/* <p id="registered" onClick={() =>navigate("/signup")}>Signup</p> */}
        </form>

        <div className='error'>
        {errorMsg && <p>{errorMsg}</p>}
        </div>
        
    </div>
  )
}

export default Login