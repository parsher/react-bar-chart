import React from "react";
import "./App.css";
import { Chart } from "./component/Chart";

// 시세차트 BTC_KRW
// 가격, 날짜, 차트 봉(최대,최소,종가)
// 마우스: 휠 확대/축소, 좌/우 드래그 > 임의 샘플 데이터 중복 사용가능
// 오픈 소스 사용가능
// README.MD에 명시
function App() {
    return (
        <div className="App">
            <Chart />
        </div>
    );
}

export default App;
