import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { loadUser, signOut } from "../../actions/authAction";
import userApi from "../../api/userApi";
import "./navbar.scss";
import UserMenu from "../user/userMenu";

function Navbar() {
  let dispatch = useDispatch();
  let history = useHistory();

  useEffect(() => {
    async function getUserInfo() {
      try {
        if (!localStorage.getItem("token")) return;
        let res = await userApi.getUserInfo();
        console.log("res: ", res);
        dispatch(loadUser(res.user));
      } catch (error) {}
    }
    getUserInfo();
  }, []);

  let user = useSelector((state) => state.auth);

  const logOut = () => {
    console.log("out");
    dispatch(signOut());
    history.push("/");
    return;
  };

  return (
    <nav className="nav">
      <Link to="/">
        <img
          className="nav__logo"
          src={require("../../img/logo.png")}
          alt="Home"
        />
      </Link>
      <div className="nav__links">
        <ul className="nav__links--pages">
          <li className="nav__link">
            <Link to="/">
              <i class="fas fa-home"></i> HOME
            </Link>
          </li>
          <li className="nav__link">
            <Link to="/blog">
              <i class="fab fa-blogger"></i> BLOGS
            </Link>
          </li>
          <li className="nav__link">
            <Link to="/shop">
              <i class="fas fa-cart-plus"></i> SHOP
            </Link>
          </li>
        </ul>
      </div>
      <div className="nav__links">
        <ul className="nav__links--auth">
          {!user.user && (
            <>
              <li className="nav__link">
                <Link to="/sign-in">
                  <i class="fas fa-sign-in-alt"></i> Sign In
                </Link>
              </li>
              <li className="nav__link">
                <Link to="/sign-up">
                  <i class="fas fa-user-plus"></i> Register
                </Link>
              </li>
            </>
          )}
          {user.user && (
            <>
              <div class="nav__userIcon">
                {
                  <li className="nav__link nav__link--user">
                    {user.user.name}
                  </li>
                }
                <UserMenu />
              </div>
              <li className="nav__link nav__link--logout" onClick={logOut}>
                Log Out <i class="fas fa-sign-out-alt"></i>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
