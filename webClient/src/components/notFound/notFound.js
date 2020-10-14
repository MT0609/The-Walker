import React from "react";
import { Link } from "react-router-dom";
import "./notFound.scss";

function NotFound() {
  return (
    <div className="notfound">
      <h2 className="notfound__firstNoti">Oops! Page not found.</h2>
      <h1 className="notfound__secondNoti">404</h1>
      <Link to="/">
        <button className="notfound__homeBtn">GO TO HOME</button>
      </Link>
    </div>
  );
}

export default NotFound;
