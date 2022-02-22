import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import * as chartjs from 'chart.js';
import { Bar } from 'react-chartjs-2';
import ChartJSDataLabels from 'chartjs-plugin-datalabels';
import axios, { AxiosResponse } from 'axios';
import moment from 'moment';
import constants from '../constants';

chartjs.Chart.register(ChartJSDataLabels);

/* eslint-disable i18next/no-literal-string */
const ChartHome = () => {
  const [statistic, setStatistic] = useState<any>();

  console.log(statistic);

  useEffect(() => {
    axios.get(constants.api.getAggregate3Days).then((res: AxiosResponse) => {
      if (res.data.success) {
        setStatistic(res.data.data);
      }
    });
  }, []);

  const io = ' €';
  const us = ' $';

  const options = {
    plugins: {
      datalabels: {
        display: true,
        color: 'white',
        formatter: (value: any, ctx: any) => {
          if (ctx.dataset.label === '.io') {
            if (ctx.dataIndex === 0) {
              return statistic[0]?.EUR?.total + io;
            }
            if (ctx.dataIndex === 1) {
              return statistic[1]?.EUR?.total + io;
            }
            if (ctx.dataIndex === 2) {
              return statistic[2]?.EUR?.total + io;
            }
          }
          if (ctx.dataset.label === '.us') {
            if (ctx.dataIndex === 0) {
              return statistic[0]?.USD?.total + us;
            }
            if (ctx.dataIndex === 1) {
              return statistic[1]?.USD?.total + us;
            }
            if (ctx.dataIndex === 2) {
              return statistic[2]?.USD?.total + us;
            }
          }
          return ctx.dataset.data[ctx.dataIndex];
        }
      }
    },
    legend: {
      display: true,
      font: {
        weight: 'bold',
        size: 16
      }
    }
  };

  console.log(statistic && moment().add(-2, 'days').endOf('day').format('DD/MM/YYYY'));

  return (

    <Row>
      <Col md='6'>
        <div>{statistic ? <Bar data={{
          labels: [
            statistic
              ? moment().add(-2, 'days').endOf('day').format('DD/MM/YYYY')
              : moment(statistic[0]?.date).format('DD/MM/YYYY'),
            statistic ? moment().add(-1, 'days').endOf('day').format('DD/MM/YYYY') : moment(statistic[1]?.date).format('DD/MM/YYYY'),
            statistic
              ? moment().format('DD/MM/YYYY')
              : moment(statistic[2]?.date).format('DD/MM/YYYY')],
          datasets: [
            {
              label: '.io',
              data: [statistic[0]?.EUR?.count, statistic[1]?.EUR?.count, statistic[2]?.EUR?.count],
              backgroundColor: 'rgb(54, 162, 235)'
            },
            {
              label: '.us',
              data: [statistic[0]?.USD?.count, statistic[1]?.USD?.count, statistic[2]?.USD?.count],
              backgroundColor: 'rgb(75, 192, 192)'
            }
          ]
        }
        } options={options} /> : <p>loading</p>}
        </div>
      </Col>
    </Row>
  );
};

export default ChartHome;
/* eslint-enable i18next/no-literal-string */
