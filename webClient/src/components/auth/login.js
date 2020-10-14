import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { signIn } from "../../actions/authAction";
import userApi from "../../api/userApi";
import jwt_decode from "jwt-decode";

import "./form.scss";

function Login() {
  const [loginErr, setLoginErr] = useState("");
  const recaptchaRef = React.createRef();
  let dispatch = useDispatch();
  let history = useHistory();

  const togglePassword = (e) => {
    e.preventDefault();
    let x = document.getElementById("password");
    let passwordEye = document.getElementById("togglePassword");
    x.type === "password" ? (x.type = "text") : (x.type = "password");
    passwordEye.classList.toggle("fa-eye-slash");
  };

  const onInputChange = (e) => {
    setLoginErr("");
  };

  const login = async (e) => {
    e.preventDefault();

    const recaptchaValue = recaptchaRef.current.getValue();
    if (!recaptchaValue) {
      alert("Check reCaptcha!");
      return;
    }

    let { email, password } = e.target;
    email = email.value;
    password = password.value;

    if (!email) {
      alert("Please fill out email");
      return;
    }

    if (password.length < 6 || password.length > 20) {
      alert("Password length must be from 6-20 characters");
      return;
    }

    try {
      let res = await userApi.signIn({ email, password });
      if (res.msg === "Auth failed!") {
        setLoginErr("Email or Password is not correct");
      }
      if (res.msg === "success") {
        setLoginErr("");
        localStorage.setItem("token", res.token);
        localStorage.setItem("refreshToken", res.refreshToken);
        console.log(localStorage.getItem("token"));
        let user = jwt_decode(res.token);
        dispatch(signIn(user));
        history.push("/");
      }
    } catch (error) {
      console.log(error);
      setLoginErr("Email or Password is not correct");
    }
  };

  return (
    <div className="form__container">
      <div className="form form__login">
        <Link to="/forgot">Forgot Password</Link>
        <Link to="/sign-up">Not have an account?</Link>
        {loginErr && <p className="form__error">{loginErr}</p>}
        <form onSubmit={login}>
          <div className="form__input">
            <input
              type="email"
              name="email"
              onChange={onInputChange}
              placeholder="Email..."
            />
            <span class="form__input--focus"></span>
          </div>
          <div className="form__input">
            <input
              type="password"
              name="password"
              id="password"
              onChange={onInputChange}
              placeholder="Your password"
            />
            <span class="form__input--focus"></span>
            <button
              class="form__input--eye"
              type="button"
              onClick={togglePassword}
            >
              <i class="far fa-eye" id="togglePassword"></i>
            </button>
          </div>
          <div className="recaptcha">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_KEY}
            />
          </div>
          <input type="submit" value="LOG IN" />
        </form>
      </div>
    </div>
  );
}

export default Login;
