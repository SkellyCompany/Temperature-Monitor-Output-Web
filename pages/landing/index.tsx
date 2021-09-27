import css from "./index.module.scss";
import useTranslation from "next-translate/useTranslation";
import Locales from "../../global/Locales";
import { AppLogger } from "../../utilities/app-logger/AppLogger";
import { useEffect, useState } from "react";
import { LogType } from "../../utilities/app-logger/models/LogType";
import { LogRecipient } from "../../utilities/app-logger/models/LogRecipient";
import { GetServerSideProps } from "next";
import {
  BasePageHOC,
  basePagePropsServerSide,
  IBasePageHOCProps,
} from "../../ui/hocs/base/BasePage.hoc";
import io from "socket.io-client";
import { TemperatureRecord } from "../../domain/entities/TemperatureRecord";
import { HumidityRecord } from "../../domain/entities/HumidityRecord";
import { Line } from "react-chartjs-2";

function LandingPage(props: IBasePageHOCProps) {
  // MARK: Props
  const { basePageProps } = props;

  // MARK: Constants
  const landingLocale = Locales.Landing;
  const { t } = useTranslation(landingLocale.identifier);
  const logger = new AppLogger();
  const maxChartItems = 4;

  // MARK: State
  const [socket, setSocket] = useState(null);
  const [temperatureRecords, setTemperatureRecords] =
    useState<TemperatureRecord[]>(null);
  const [humidityRecords, setHumidityRecords] =
    useState<HumidityRecord[]>(null);

  const [temperatureChartData, setTemperatureChartData] = useState(null);
  const [humidityChartData, setHumidityChartData] = useState(null);

  // MARK: Effects
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL, {
      transports: ["websocket"],
    });
    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("temperatureRecords", (data) => {
        setTemperatureRecords(data);
      });
      socket.on("humidityRecords", (data) => {
        setHumidityRecords(data);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (humidityRecords) {
      let humidityChartData = {
        labels: humidityRecords
          .map((humidityRecord) => {
            let dateObject = new Date(humidityRecord.time);
            return dateObject.toLocaleString();
          })
          .slice(Math.max(humidityRecords.length - maxChartItems, 0)),
        datasets: [
          {
            label: "Humidity",
            data: humidityRecords
              .map((humidityRecord) => {
                return humidityRecord.value * 100;
              })
              .slice(Math.max(humidityRecords.length - maxChartItems, 0)),
            fill: false,
            backgroundColor: "black",
            borderColor: "black",
          },
        ],
      };
      setHumidityChartData(humidityChartData);
    }
  }, [humidityRecords]);

  useEffect(() => {
    if (temperatureRecords) {
      let temperatureChartData = {
        labels: temperatureRecords
          .map((temperatureRecord) => {
            let dateObject = new Date(temperatureRecord.time);
            return dateObject.toLocaleString();
          })
          .slice(Math.max(temperatureRecords.length - maxChartItems, 0)),
        datasets: [
          {
            label: "Temperature",
            data: temperatureRecords
              .map((temperatureRecord) => {
                return temperatureRecord.value;
              })
              .slice(Math.max(temperatureRecords.length - maxChartItems, 0)),
            fill: false,
            backgroundColor: "white",
            borderColor: "white",
          },
        ],
      };
      setTemperatureChartData(temperatureChartData);
    }
  }, [temperatureRecords]);

  // MARK: Render
  return (
    <BasePageHOC basePageProps={basePageProps}>
      <div className={css.mainContainer}>
        <div className={css.chartsContainer}>
          <div className={css.temperatureContainer}>
            <div className={css.temperatureHeader}>Temperature</div>
            {temperatureChartData && (
              <Line
                data={temperatureChartData}
                options={{
                  plugins: {
                    legend: {
                      labels: {
                        color: "white",
                        font: {
                          size: 13,
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 13,
                        },
                        callback: function (value, index) {
                          return value + " °C";
                        },
                      },
                      grid: {
                        color: "gray",
                      },
                    },
                    x: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 11,
                        },
                      },
                      grid: {
                        color: "gray",
                      },
                    },
                  },
                }}
              ></Line>
            )}
          </div>
          <div className={css.humidityContainer}>
            <div className={css.humidityHeader}>Humidity</div>
            {humidityChartData && (
              <Line
                data={humidityChartData}
                options={{
                  plugins: {
                    legend: {
                      labels: {
                        color: "black",
                        font: {
                          size: 13,
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      ticks: {
                        color: "black",
                        font: {
                          size: 13,
                        },
                        callback: function (value, index) {
                          return value + "%";
                        },
                      },
                      grid: {
                        color: "gray",
                      },
                    },
                    x: {
                      ticks: {
                        color: "black",
                        font: {
                          size: 11,
                        },
                      },
                      grid: {
                        color: "gray",
                      },
                    },
                  },
                }}
              ></Line>
            )}
          </div>
        </div>
      </div>
    </BasePageHOC>
  );
}

// MARK: Server Side Props export
export const getServerSideProps: GetServerSideProps = basePagePropsServerSide;

// MARK: Page export
export default LandingPage;
