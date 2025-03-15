import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import { MapPin, Mail, Phone, Clock } from "lucide-react"; // Import Lucide icons
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";

const ContactDetails = () => {
  return (
    <div className="h-auto relative pb-80 md:pb-60">
      <div className="lg:h-[250px] h-[120px] md:h-[180px]  w-full container mx-auto relative overflow-hidden">
        {/* Content Section */}
        <div className="flex items-center gap-3 px-5 md:px-10 py-6 mt-5 relative z-10">
          <p className="text-lg md:text-2xl text-white font-bold">تماس با ما</p>
          <hr className="flex-grow border-t border-dashed border-white" />
          <p className="text-green px-2 dark:text-black py-1 rounded-full text-sm font-bold bg-white">
            Contact Us
          </p>
        </div>

        {/* SVG Section */}
        <div className="absolute bottom-0 right-0  border-black  w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            viewBox="0 0 1440 320"
          >
            <path
              fill="#00513a"
              className="dark:fill-primary" // Change color in dark mode
              fillOpacity="1"
              d="M0,320L80,304C160,288,320,256,480,240C640,224,800,224,960,234.7C1120,245,1280,267,1360,277.3L1440,288L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            ></path>
          </svg>
        </div>
      </div>
      {/* Card Content */}
      <div className="absolute h-auto w-[95%] md:w-[80%] lg:w-[70%] mx-auto flex flex-col md:flex-row top-24 md:top-28 lg:top-32 right-1/2 transform translate-x-1/2 border-2 rounded-2xl z-10 dark:border-secondary bg-white dark:bg-primary">
        <div className="w-full md:w-[40%] flex flex-col justify-center py-10 px-3">
          {/* Address */}
          <div className="flex justify-between items-center gap-1 h-12">
            <div className="flex items-center gap-4">
              <MapPin className="text-green w-5 h-5" />{" "}
              {/* Lucide MapPin icon */}
              <p className="text-gray-700 text-sm font-medium dark:text-gray-300">
                {" "}
                نشانی ما
              </p>
            </div>
            <p className="text-gray-700 text-sm font-medium dark:text-gray-300 text-right">
              کوتة سنگی، سرک دهبوری، مارکیت اتفاق
            </p>
          </div>
          {/* Email */}
          <div className="flex justify-between items-center gap-2 border-t h-12">
            <div className="flex items-center gap-4">
              <Mail className="text-green w-5 h-5" /> {/* Lucide Mail icon */}
              <p className="text-gray-700 text-sm font-medium dark:text-gray-300">
                ایمیل
              </p>
            </div>
            <p className="text-gray-700 text-sm font-medium dark:text-gray-300 text-right">
              tamadon.af@gmail.com
            </p>
          </div>
          {/* Phone */}
          <div className="flex justify-between items-center gap-2 border-t h-12">
            <div className="flex items-center gap-4">
              <Phone className="text-green w-5 h-5" /> {/* Lucide Phone icon */}
              <p className="text-gray-700 text-sm font-medium dark:text-gray-300">
                تلفن
              </p>
            </div>
            <p className="text-gray-700 text-sm font-medium dark:text-gray-300 text-right">
              93-772-029-545+
            </p>
          </div>
       
          {/* Response Hours */}
          <div className="flex justify-between items-center gap-2 border-t border-b h-12">
            <div className="flex items-center gap-4">
              <Clock className="text-green w-5 h-5" /> {/* Lucide Clock icon */}
              <p className="text-gray-700 text-sm dark:text-gray-300 font-medium">
                ساعات پاسخگویی
              </p>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium text-right">
              شنبه تا پنجشنبه 8 الی 5
            </p>
          </div>
        </div>

        <div className="w-full md:w-[60%] p-2">
          <a
            href="https://www.google.com/maps/place/%D9%85%D8%B7%D8%A8%D8%B9%D9%87+%D8%AA%D9%85%D8%AF%D9%86+,Tamadon+printing+press%E2%80%AD/@34.5119474,69.1116721,16z/data=!4m10!1m2!2m1!1sTamadon+Printing+Press+!3m6!1s0x38d16fb010b591ab:0x7ab5fcf1055fd49a!8m2!3d34.5119312!4d69.1196991!15sChZUYW1hZG9uIFByaW50aW5nIFByZXNzkgEYZGlnaXRhbF9wcmludGluZ19zZXJ2aWNl4AEA!16s%2Fg%2F11hyyh1lgq?entry=ttu&g_ep=EgoyMDI1MDIwNS4xIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noreferrer"
            className="w-full h-full"
          >
            <img
              src='map.png'
              alt="map"
              className="w-full h-64 md:h-full rounded-2xl object-cover"
            />
          </a>
        </div>
      </div>{" "}
    </div>
  );
};

export default ContactDetails;
