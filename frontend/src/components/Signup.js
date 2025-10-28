import React from 'react';
import {useState} from 'react';
import "./Auth.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {

    const [data,setData] = useState({name:"",email:"",
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

    const handleSignup = async(e) =>{
        e.preventDefault();
        console.log("Send the Details");

        axios.post("http://localhost:5000/register",data)
        .then((res) =>{
            if(res.status == 201){
                setError(res.data.message);
                setTimeout(() =>navigate('/login'),1000);
                
            }
        })
        .catch((err)=>{
            setError("SignUp Failed");
            console.log(err);
        })
    }

  return (
    <div className='main'>
        <h3>SignUp</h3>
        <form onSubmit={handleSignup}>
            <div className='input'>
                <label htmlFor='name'>Name</label>
                <input type='text' name='name' placeholder='Enter Your Name' onChange={handleChange} />
            </div>
            <div className='input'>
                <label htmlFor='email'>Email</label>
                <input type='email' name='email' placeholder='Enter Your Email' onChange={handleChange} />
            </div>
            <div className='input'>
                <label htmlFor='password'>Password</label>
                <input type='password' name='password' placeholder='Password' onChange={handleChange} />
            </div>
            

            <button className="login-btn" type='submit'>SignUp</button>
            
        </form>

        <div className='error'>
        {errorMsg && <p>{errorMsg}</p>}
        </div>
        
    </div>
  )
}

export default Signup;