import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useStore } from '../store';
import { motion } from 'framer-motion';

export const Statistics: React.FC = () => {
  const { sessions } = useStore();
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, 'dark');
    
    // Process data for trend chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const dailyData = last7Days.map(date => {
      const daySessions = sessions.filter(s => 
        new Date(s.timestamp).toISOString().split('T')[0] === date
      );
      return daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    });

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 43, 61, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: last7Days.map(d => d.slice(5)),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: { color: 'rgba(255,255,255,0.4)' }
      },
      yAxis: {
        type: 'value',
        name: '分钟',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
        axisLabel: { color: 'rgba(255,255,255,0.4)' }
      },
      series: [{
        data: dailyData,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#FF8C42' },
        lineStyle: { width: 4, color: '#FF8C42' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 140, 66, 0.3)' },
            { offset: 1, color: 'rgba(255, 140, 66, 0)' }
          ])
        }
      }]
    };

    chart.setOption(option);

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [sessions]);

  // Heatmap logic
  const today = new Date();
  const yearAgo = new Date();
  yearAgo.setFullYear(today.getFullYear() - 1);
  
  const days = [];
  for (let d = new Date(yearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }

  const getIntensity = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const daySessions = sessions.filter(s => 
      new Date(s.timestamp).toISOString().split('T')[0] === dateStr
    );
    const total = daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    if (total === 0) return 'bg-white/5';
    if (total < 30) return 'bg-orange/20';
    if (total < 60) return 'bg-orange/40';
    if (total < 120) return 'bg-orange/70';
    return 'bg-orange';
  };

  return (
    <div className="p-6 space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <h3 className="text-lg font-medium text-white mb-6">专注趋势 (近7天)</h3>
        <div ref={chartRef} className="w-full h-[300px]" />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md overflow-hidden">
        <h3 className="text-lg font-medium text-white mb-6">年度专注热力图</h3>
        <div className="flex flex-wrap gap-1 justify-center">
          {days.map((date, i) => (
            <div
              key={i}
              title={`${date.toLocaleDateString()}`}
              className={`w-3 h-3 rounded-sm ${getIntensity(date)} transition-colors duration-500`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-xs text-white/40">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-white/5" />
          <div className="w-3 h-3 rounded-sm bg-orange/20" />
          <div className="w-3 h-3 rounded-sm bg-orange/40" />
          <div className="w-3 h-3 rounded-sm bg-orange/70" />
          <div className="w-3 h-3 rounded-sm bg-orange" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
