import React from "react";
import { BiBed, BiBookAdd, BiGroup, BiHome } from "react-icons/bi";
import { FaAmbulance, FaChevronDown, FaHeartbeat } from "react-icons/fa";
import { FaClipboardUser } from "react-icons/fa6";
const AdminMainPage = () => {
  const overviewdata = [
    {
      title: "تعداد کاربران ",
      number: 354,
      icon: <BiGroup size={24} className="text-blue-500" />,
    },
    {
      title: "تعداد  دیزاینر ",
      number: "3,454",
      icon: <FaClipboardUser size={24} className="text-violet-600" />,
    },
    {
      title: "Avg Treat, Costs",
      number: "$2,054",
      icon: <BiBookAdd size={24} className="text-orange-500" />,
    },
    {
      title: "Available Cars",
      number: 34,
      icon: <FaAmbulance size={24} className="text-pink-800" />,
    },
    {
      title: "Available Cars",
      number: 34,
      icon: <FaAmbulance size={24} className="text-pink-800" />,
    },
  ];
  return (
    <div className="">
      {/* Overview Cards */}
      <div className="grid grid-cols-5 gap-x-5">
        {overviewdata.map((item, index) => (
          <div
            key={index}
            className="h-[100px] xl:h-[120px] bg-white shadow-md rounded-lg px-10 py-4 flex justify-between items-center"
          >
            <div className="flex items-center justify-center gap-x-7">
              <span className="p-3 rounded-full bg-gray-200">{item.icon}</span>
              <div>
                <span className="text-xl font-bold">{item.number}</span>
                <p className="font-semibold text-gray-700">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminMainPage;
