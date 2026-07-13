import React, { useRef, useEffect } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import {
  Chart, DoughnutController, ArcElement, Tooltip, Legend,
} from 'chart.js';

// Register required Chart.js components including Legend
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

function DoughnutChart({ data, width, height }) {
  const canvas = useRef(null);
  const chartRef = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;
    if (!ctx) return;

    // Destroy any stale chart on this canvas before creating a new one
    const stale = Chart.getChart(ctx);
    if (stale) stale.destroy();
    if (chartRef.current) chartRef.current.destroy();

    const newChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        cutout: '80%',
        layout: { padding: 24 },
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: darkMode ? '#9ca3af' : '#6b7280',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 8,
            },
          },
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
        },
        interaction: { intersect: false, mode: 'nearest' },
        animation: { duration: 500 },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    chartRef.current = newChart;

    return () => {
      newChart.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update chart theme when dark mode toggles
  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    c.options.plugins.tooltip.titleColor = darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light;
    c.options.plugins.tooltip.bodyColor = darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light;
    c.options.plugins.tooltip.backgroundColor = darkMode ? tooltipBgColor.dark : tooltipBgColor.light;
    c.options.plugins.tooltip.borderColor = darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light;
    if (c.options.plugins.legend && c.options.plugins.legend.labels) {
      c.options.plugins.legend.labels.color = darkMode ? '#9ca3af' : '#6b7280';
    }
    c.update('none');
  }, [currentTheme]);

  return (
    <div className="grow flex flex-col justify-center">
      <div>
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </div>
  );
}

export default DoughnutChart;