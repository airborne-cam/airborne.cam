import React from 'react'
import ReactApexChart from 'react-apexcharts'

const Chart = ({ series, title, yAxisLabel, xAxisLabel }) => {
  const chartData = {
    series,
    options: {
      chart: {
        toolbar: { show: false },
        height: '350',
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      title: {
        text: title,
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      yaxis: {
        title: {
          text: yAxisLabel
        },
        labels: {
          formatter: function (value) {
            return value.toFixed(2)
          }
        }
      },
      xaxis: {
        title: { text: xAxisLabel, offsetY: 10 },
        type: 'numeric',
        labels: {
          formatter: function (value) {
            return value.toFixed(2)
          }
        }
      }
    }
  }

  return (
    <ReactApexChart
      options={chartData.options}
      series={chartData.series}
      type="line"
    />
  )
}

export default Chart
