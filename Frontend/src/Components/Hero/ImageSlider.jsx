import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { MdArrowForwardIos, MdArrowBackIos } from "react-icons/md";
import axios from "axios";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ImageSlider = () => {
  const [sliders, setSliders] = useState([]);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/common/upload-image/`);
        if (Array.isArray(response.data)) {
          setSliders(response.data);
        } else {
          console.error("Expected an array of sliders but got:", response.data);
          setSliders([]);
        }
      } catch (error) {
        console.error("An error occurred while loading the data:", error);
        setSliders([]);
      }
    };

    fetchSliders();
  }, []);

  return (
    <div className="w-full h-[200px] md:h-[300px] lg:h-[500px] relative group ">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        pagination={{ clickable: true }} // ✅ Let Swiper handle pagination
        autoplay={{ delay: 4000 }}
        
        spaceBetween={100}
        slidesPerView={1}
        navigation={{
          nextEl: ".button-next-slide",
          prevEl: ".button-prev-slide",
        }}
        grabCursor={true}
        className="overflow-visible shadow-lg cursor-pointer relative"
      >
        {sliders.length > 0 ? (
          sliders.map((slide, index) => (
            <SwiperSlide key={index}>
              <img
                src={`${BASE_URL}${slide.images}`}
                alt={`Slide ${index + 1}`}
                className="w-full h-[200px] md:h-[300px] lg:h-[500px]  object-cover cursor-pointer"
              />
            </SwiperSlide>
          ))
        ) : (
          <div className="w-full h-64 flex items-center justify-center text-gray-500">
           تصاویری در دسترس نیست </div>
        )}
         <div className="button-next-slide group-hover:flex hidden w-[40px] h-[40px] items-center justify-center rounded-full absolute top-1/2 right-5 -translate-y-1/2 z-20 bottom-10 md:bg-white">
          <MdArrowForwardIos />
        </div>
        <div className="button-prev-slide group-hover:flex hidden w-[40px] h-[40px] items-center justify-center rounded-full absolute top-1/2 -translate-y-1/2 left-5 z-20 bottom-10 md:bg-white">
          <MdArrowBackIos />
        </div>
      </Swiper>
    </div>
  );
};

export default ImageSlider;
