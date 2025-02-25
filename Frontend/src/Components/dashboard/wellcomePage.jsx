import AdminCards from "./dashboardChart/AdminCards";
import MonthlyOrdersChart from "./dashboardChart/monthlyOrdersChart";
import OrdersComparisonChart from "./dashboardChart/ordersCamparisonChart";
import OrdersStatusPieChart from "./dashboardChart/orderStatusPieChart";
import OrdersTrendChart from "./dashboardChart/ordersTrendChart";
import CryptoJS from "crypto-js";

const AdminDashboard = () => {
  const secretKey = "TET4-1"; // Use a strong secret key
  const decryptData = (hashedData) => {
    if (!hashedData) {
      console.error("No data to decrypt");
      return null;
    }
    try {
      const bytes = CryptoJS.AES.decrypt(hashedData, secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  };
  const role = decryptData(localStorage.getItem("role"));
  return (
    <div className="p-6 bg-gray-100 h-screen">
      {role == "0" && <AdminCards />}
      {role == "1" && <MonthlyOrdersChart chartData={chartData} />}
      {role == "2" && <OrdersComparisonChart chartData={chartData} />}
      {role == "3" && <OrdersStatusPieChart chartData={chartData} />}
      {role == "4" && <OrdersTrendChart chartData={chartData} />}
    </div>
  );
};

export default AdminDashboard;
