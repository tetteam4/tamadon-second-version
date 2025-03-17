import { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import axios from "axios";
import moment from "moment";
import "moment-jalaali"; // Make sure this is imported after moment

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const Price = ({ editingPriceId, setShowPrice }) => {
  const [modalData, setModalData] = useState({
    id: null,
    receive_price: "",
    price: "",
    reminder_price: "",
    delivery_date: "",
    order: editingPriceId,
  });
  const [editingPriceID, setEditingPriceID] = useState(editingPriceId);

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setModalData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEdite = async (editingPriceID) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/group/order-by-price/?order=${editingPriceID}`
      );
      setModalData(response.data[0]);
      console.log(response.data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        id: modalData.id,
        order: editingPriceId,
        price: modalData.price,
        receive_price: modalData.receive_price,
        reminder_price: String(modalData.price - modalData.receive_price),
        delivery_date: modalData.delivery_date,
      };
      console.log(payload);

      const response = await axios.put(
        `${BASE_URL}/group/order-by-price/${modalData.id}/`,
        payload
      );
      console.log(payload);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDateChange = (date) => {
    const formattedDate = date.format("YYYY/MM/DD").toString(); // Ensure it's a string
    setModalData((prevData) => ({
      ...prevData,
      delivery_date: toEnglishDigits(formattedDate), // Store Jalali date in English numbers
    }));
  };

  // Function to convert Persian digits to English
  const toEnglishDigits = (str) => {
    if (typeof str !== "string") return str; // Ensure str is a string
    const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
    return str.replace(/[۰-۹]/g, (d) => persianNumbers.indexOf(d));
  };

  useEffect(() => {
    handleEdite(editingPriceID);
  }, []);

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col gap-5 items-center justify-center">
        <div className="bg-white">
          <div className="bg-white p-6 rounded w-[350px] md:w-[600px]">
            <h3 className="text-lg text-center font-bold mb-4">
              اضافه کردن قیمت و تاریخ تحویل
            </h3>
            <div className="mb-4">
              <label className="block mb-1 font-medium">قیمت:</label>
              <input
                type="number"
                name="price"
                value={modalData.price || ""}
                onChange={handleModalChange}
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
                placeholder="قیمت را وارد کنید"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">قیمت دریافتی:</label>
              <input
                type="number"
                name="receive_price"
                value={modalData.receive_price}
                onChange={handleModalChange}
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
                placeholder="قیمت دریافتی را وارد کنید"
                required
              />
            </div>

            <div className="mb-4 w-full flex items-center gap-x-5 justify-center">
              <label className="block mb-1 font-medium">تاریخ تحویل:</label>
              <DatePicker
                value={modalData.delivery_date}
                onChange={handleDateChange}
                calendar={persian} // Use Hijri Shamsi (Jalali) Calendar
                locale={persian_fa} // Persian language support
                inputClass="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
          </div>
          <div className="flex justify-center pb-6 items-center gap-2">
            <button
              onClick={handleSubmit}
              className="bg-green text-white px-7 font-bold py-2 rounded hover:bg-green/90"
            >
              تایید
            </button>
            <button
              onClick={() => setShowPrice(false)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
