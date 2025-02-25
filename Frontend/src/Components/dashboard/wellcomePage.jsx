import AdminCards from "./dashboardChart/AdminCards";
import MonthlyOrdersChart from "./dashboardChart/monthlyOrdersChart";
import OrdersComparisonChart from "./dashboardChart/ordersCamparisonChart";
import OrdersStatusPieChart from "./dashboardChart/orderStatusPieChart";
import OrdersTrendChart from "./dashboardChart/ordersTrendChart";

const AdminDashboard = ({ role, orderData, chartData }) => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {role == "0" && <AdminCards orderData={orderData} />}
      {role == "1" && <MonthlyOrdersChart chartData={chartData} />}
      {role == "2" && <OrdersComparisonChart chartData={chartData} />}
      {role == "3" && <OrdersStatusPieChart chartData={chartData} />}
      {role == "4" && <OrdersTrendChart chartData={chartData} />}
    </div>
  );
};

export default AdminDashboard;
