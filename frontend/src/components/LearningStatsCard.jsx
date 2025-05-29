import CheckInCard from "./CheckInCard";
import { useState } from "react";

function LearningStatsCard() {
  const [checkIns, setCheckIns] = useState(["2025-05-26", "2025-05-27"]);

  return (
        <CheckInCard checkIns={checkIns} setCheckIns={setCheckIns} />
  );
}

export default LearningStatsCard;
