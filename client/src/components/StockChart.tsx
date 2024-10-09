"use client"; // Add this line

import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const StockChart: React.FC = () => {
  const chartRef = useRef(null); // Example usage of useRef

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Stock Price',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false, // CHANGE TO TRUE FOR HIGHLIGHT UNDER LINE
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#22c55e', // Set line color to green
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white', // Set legend text color to white
        },
      },
      title: {
        display: true,
        text: 'Stock Prices Over Time',
        color: 'white', // Set title color to white
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', // Set x-axis tick color to white
        },
      },
      y: {
        ticks: {
          color: 'white', // Set y-axis tick color to white
        },
      },
    },
  };

  return (
    <div className="line-chart">
      <Line
        options={options}
        data={data}
        style={{ height: '500px', width: '100%' }} // Force size
      />
    </div>
  );
};

export default StockChart;
