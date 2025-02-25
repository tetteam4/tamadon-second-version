import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PrinterMainPage = ({ chartData }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={chartData}>
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
  );
};

export default PrinterMainPage;
