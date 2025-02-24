import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

const BASE_URL = "http://localhost:8000";

const AdminDashboard = () => {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [processingOrders, setProcessingOrders] = useState([]);
  const [takenOrders, setTakenOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const completedResponse = await fetch(`${BASE_URL}/group/order/done/`);
        const completedData = await completedResponse.json();
        setCompletedOrders(completedData);

        const processingResponse = await fetch(
          `${BASE_URL}/group/order/processing/`
        );
        const processingData = await processingResponse.json();
        setProcessingOrders(processingData);

        const takenResponse = await fetch(`${BASE_URL}/group/order/taken/`);
        const takenData = await takenResponse.json();
        setTakenOrders(takenData);

        const pendingResponse = await fetch(`${BASE_URL}/group/order/pending/`);
        const pendingData = await pendingResponse.json();
        setPendingOrders(pendingData);

        const deliveredResponse = await fetch(
          `${BASE_URL}/group/order/delivered/`
        );
        const deliveredData = await deliveredResponse.json();
        setDeliveredOrders(deliveredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">در حال بارگذاری...</div>;
  }

  const totalCompletedOrders = completedOrders.length;
  const totalProcessingOrders = processingOrders.length;
  const totalTakenOrders = takenOrders.length;
  const totalPendingOrders = pendingOrders.length;
  const totalDeliveredOrders = deliveredOrders.length;

  const lineChartData = [
    {
      name: "حوت",
      completed: totalCompletedOrders,
      processing: totalProcessingOrders,
      taken: totalTakenOrders,
      pending: totalPendingOrders,
      delivered: totalDeliveredOrders,
    },
    {
      name: "حمل",
      completed: 300,
      processing: 150,
      taken: 100,
      pending: 50,
      delivered: 200,
    },
    {
      name: "",
      completed: 200,
      processing: 100,
      taken: 60,
      pending: 30,
      delivered: 150,
    },
    {
      name: "جوزا",
      completed: 278,
      processing: 130,
      taken: 90,
      pending: 40,
      delivered: 180,
    },
    {
      name: "سرطان",
      completed: 189,
      processing: 90,
      taken: 50,
      pending: 20,
      delivered: 100,
    },
    {
      name: "اسد",
      completed: 239,
      processing: 110,
      taken: 70,
      pending: 35,
      delivered: 120,
    },
  ];

  const barChartData = [
    {
      name: "حمل",
      completed: 2400,
      processing: 1200,
      taken: 800,
      pending: 400,
      delivered: 1600,
    },
    {
      name: "ثور",
      completed: 1398,
      processing: 900,
      taken: 500,
      pending: 300,
      delivered: 1000,
    },
    {
      name: "جوزا",
      completed: 9800,
      processing: 4000,
      taken: 2000,
      pending: 1000,
      delivered: 3000,
    },
    {
      name: "سرطان",
      completed: 3908,
      processing: 2000,
      taken: 1000,
      pending: 500,
      delivered: 1500,
    },
    {
      name: "اسد",
      completed: 4800,
      processing: 3000,
      taken: 1500,
      pending: 750,
      delivered: 2000,
    },
    {
      name: "سنبله",
      completed: 3800,
      processing: 2500,
      taken: 1200,
      pending: 600,
      delivered: 1800,
    },
  ];

  const pieChartData = [
    { name: "تکمیل شده", value: totalCompletedOrders },
    { name: "در حال پردازش", value: totalProcessingOrders },
    { name: "تحویل گرفته شده", value: totalTakenOrders },
    { name: "در انتظار", value: totalPendingOrders },
    { name: "تحویل داده شده", value: totalDeliveredOrders },
  ];

  const colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
      </div>

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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">وضعیت سفارشات</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">روند سفارشات</CardTitle>
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
    </div>
  );
};

export default AdminDashboard;
