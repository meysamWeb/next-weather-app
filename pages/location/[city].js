import React from "react";
import cities from "../../lib/city.list.json";
import Head from "next/head";
import moment from "moment-timezone";
import TodaysWeather from "../../components/TodaysWeather";
import HourlyWeather from "../../components/HourlyWeather";
import WeeklyWeather from "../../components/WeeklyWeather";
import SearchBox from "../../components/SearchBox";
import Link from "next/link";

export async function getServerSideProps(context) {
    const city = getCity(context.params.city);

    // console.log(city);

    if (!city) {
        return {
            notFound: true,
        };
    }

    // console.log(process.env.API_KEY)

    const res = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${city.coord.lat}&lon=${city.coord.lon}&appid=${process.env.API_KEY}&units=metric&exclude=minutely`);

    const data = await res.json();

    if (!data) {
        return {
            notFound: true,
        };
    }

    // console.log(data)
    //
    // const slug = context.params.city;


    const hourlyWeather = getHourlyWeather(data.hourly, data.timezone);
    console.log(hourlyWeather);

    return {
        props: {
            // slug: slug,
            // data: data,
            city: city,
            timezone: data.timezone,
            currentWeather: data.current,
            dailyWeather: data.daily,
            hourlyWeather: hourlyWeather,
        },
    };
}

const getCity = param => {
    const cityParam = param.trim();
    // get the id of the city
    const splitCity = cityParam.split("-");
    // console.log(splitCity);
    const id = splitCity[splitCity.length - 1];
    // console.log(id)

    if (!id) {
        return null;
    }

    const city = cities.find(city => city.id.toString() == id);

    if (city) {
        return city;
    } else {
        return null;
    }
};

const getHourlyWeather = (hourlyData, timezone) => {
    // const current = new Date();
    // current.setHours(current.getHours(), 0, 0, 0);
    //
    // const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // tomorrow.setHours(0, 0, 0, 0);
    //
    //
    // //divide by 1000 to get timestamps in seconds
    // const currentTimeStamp = Math.floor(current.getTime() / 1000);
    // const tomorrowTimeStamp = Math.floor(tomorrow.getTime() / 1000);

    const endOfDay = moment().tz(timezone).endOf('day').valueOf();
    const eodTimeStamp = Math.floor(endOfDay / 1000);


    const todaysData = hourlyData.filter(data => data.dt < eodTimeStamp);

    return todaysData;

}

export default function City({hourlyWeather, currentWeather, dailyWeather, city, timezone}) {

    return (
        <>
            <Head>
                <title>{city.name} - weather app #2 - NextJs</title>
            </Head>

            <div className="page-wrapper">
                <div className="container">
                    <Link href="/">
                        <a className="back-link">&larr; Home</a>
                    </Link>
                    <SearchBox placeholder="Search for another location ..." />
                    <TodaysWeather city={city} weather={dailyWeather[0]} timezone={timezone} />

                    <HourlyWeather hourlyWeather={hourlyWeather} timezone={timezone}/>

                    <WeeklyWeather weeklyWeather={dailyWeather} timezone={timezone}/>
                </div>
            </div>
        </>
    )
}