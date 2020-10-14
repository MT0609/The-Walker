import React from "react";
import Carousel from "react-bootstrap/Carousel";
import "./home.scss";

function Home() {
  return (
    <div className="home">
      <Carousel>
        <Carousel.Item>
          <img
            className="carousel__img"
            src={require("../../img/carousel_bg1.png")}
            alt="First slide"
          />
          <Carousel.Caption>
            <h3 className="carousel__title">First slide label</h3>
            <p className="carousel__caption">
              Nulla vitae elit libero, a pharetra augue mollis interdum.
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="carousel__img"
            src={require("../../img/carousel_bg2.png")}
            alt="Second slide"
          />
          <Carousel.Caption>
            <h3 className="carousel__title">Second slide label</h3>
            <p className="carousel__caption">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </Carousel.Caption>
        </Carousel.Item>

        <Carousel.Item>
          <img
            className="carousel__img"
            src={require("../../img/carousel_bg3.png")}
            alt="Third slide"
          />
          <Carousel.Caption>
            <h3 className="carousel__title">Third slide label</h3>
            <p className="carousel__caption">
              Praesent commodo cursus magna, vel scelerisque nisl consectetur.
            </p>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </div>
  );
}

export default Home;
