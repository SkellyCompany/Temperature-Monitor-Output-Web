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

function LandingPage(props: IBasePageHOCProps) {
  // MARK: Props
  const { basePageProps } = props;

  // MARK: Constants
  const landingLocale = Locales.Landing;
  const { t } = useTranslation(landingLocale.identifier);
  const logger = new AppLogger();

  // MARK: State
  const [socket, setSocket] = useState(null);
  const [temperatureRecords, setTemperatureRecords] =
    useState<TemperatureRecord[]>(null);
  const [humidityRecords, setHumidityRecords] =
    useState<HumidityRecord[]>(null);

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

  // MARK: Render
  return (
    <BasePageHOC basePageProps={basePageProps}>
      <div className={css.mainContainer}>
        {t(landingLocale.title)} Temperature Monitor Output Web
      </div>
    </BasePageHOC>
  );
}

// MARK: Server Side Props export
export const getServerSideProps: GetServerSideProps = basePagePropsServerSide;

// MARK: Page export
export default LandingPage;
