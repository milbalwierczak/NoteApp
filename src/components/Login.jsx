import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { Password } from "@mui/icons-material";

function Login(props) {
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setUserData((prevData) => {
      return {
        ...prevData,
        [name]: value,
      };
    });
  }

  function handleLogin(event) {
    props.onLogin(userData);
    event.preventDefault();
  }

  function handleRegister(event) {
    props.onRegister(userData);
    event.preventDefault();
  }



  return (
    <div className="login-area">
      <input
        type="text"
        name="username"
        value={userData.username}
        onChange={handleChange}
        placeholder="Username"
      />
      <input
        type="password"
        name="password"
        value={userData.password}
        onChange={handleChange}
        placeholder="Password"
      />
    {props.errorMessage && <p className="error">{props.errorMessage}</p>} 
    {props.successMessage && <p className="success">{props.successMessage}</p>} 
    <button className="login-button" onClick={handleLogin}>
      Login
    </button>
    <button  onClick={handleRegister}> 
      Register
    </button>
  </div>
  );
}

export default Login;
