import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function DailyCorrectChart() {
  // 假資料：你之後可從後端 API 動態取
  const data = [
    { date: '5/21', correct: 5 },
    { date: '5/22', correct: 7 },
    { date: '5/23', correct: 4 },
    { date: '5/24', correct: 9 },
    { date: '5/25', correct: 6 },
    { date: '5/26', correct: 3 },
    { date: '5/27', correct: 8 },
  ];

  return (
    <div className="bg-white rounded-xl p-6 w-full h-full">
      <h3 className="text-lg font-semibold mb-2 text-blue-600">📈 每日答對單字數</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="correct" stroke="#3b82f6" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailyCorrectChart;
