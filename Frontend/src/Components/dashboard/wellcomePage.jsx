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
<<<<<<< HEAD
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                سفارشات تکمیل شده
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalCompletedOrders}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                سفارشات در حال پردازش
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalProcessingOrders}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                سفارشات تحویل گرفته شده
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalTakenOrders}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                سفارشات در انتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalPendingOrders}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">
                سفارشات تحویل داده شده
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{totalDeliveredOrders}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              سفارشات ماهانه
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="processing" stroke="#82ca9d" />
                <Line type="monotone" dataKey="taken" stroke="#FFBB28" />
                <Line type="monotone" dataKey="pending" stroke="#FF8042" />
                <Line type="monotone" dataKey="delivered" stroke="#AF19FF" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              سفارشات ماهانه (مقایسه)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#8884d8" />
                <Bar dataKey="processing" fill="#82ca9d" />
                <Bar dataKey="taken" fill="#FFBB28" />
                <Bar dataKey="pending" fill="#FF8042" />
                <Bar dataKey="delivered" fill="#AF19FF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              وضعیت سفارشات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              روند سفارشات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="processing"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="taken"
                  stroke="#FFBB28"
                  fill="#FFBB28"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stroke="#FF8042"
                  fill="#FF8042"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="#AF19FF"
                  fill="#AF19FF"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
     </div>
=======
    <div className="p-6 bg-gray-100 h-screen">
      {role == "0" && <AdminCards />}
      {role == "1" && <MonthlyOrdersChart chartData={chartData} />}
      {role == "2" && <OrdersComparisonChart chartData={chartData} />}
      {role == "3" && <OrdersStatusPieChart chartData={chartData} />}
      {role == "4" && <OrdersTrendChart chartData={chartData} />}
    </div>
>>>>>>> 04580d9cc762d0787f0821e359bddc59cbf99a9d
  );
};

export default AdminDashboard;
