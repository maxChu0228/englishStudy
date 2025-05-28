import CheckInCard from "./CheckInCard";
import DailyCorrectChart from "./DailyCorrectChart";
import { useState } from "react";

function LearningStatsCard() {
  const [checkIns, setCheckIns] = useState(["2025-05-26", "2025-05-27"]);

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CheckInCard checkIns={checkIns} setCheckIns={setCheckIns} />
        <DailyCorrectChart />
      </div>
    </div>
  );
}

export default LearningStatsCard;
