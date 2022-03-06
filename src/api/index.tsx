import axios, { HeadersDefaults } from "axios";

interface CommonHeaderProperties extends HeadersDefaults {
    ["X-CoinAPI-Key"]: string;
}

axios.defaults.baseURL = "https://rest.coinapi.io/v1";
axios.defaults.headers = {
    "X-CoinAPI-Key": process.env.REACT_APP_API_KEY,
} as CommonHeaderProperties;

export async function getOHLCV(period_id: string, timeStart: string) {
    const { data } = await axios.get(
        `/ohlcv/BITSTAMP_SPOT_BTC_USD/history?period_id=${period_id}&time_start=${timeStart}`
    );
    return data;
}
