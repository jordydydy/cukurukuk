import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const Message = ({ text, sender, chartData }) => {
    const isUser = sender === 'user';

    // Local state to control enter animation
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        // Ensure the initial class is applied before transitioning to the final state
        const raf = requestAnimationFrame(() => setEntered(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    // Build a basic ECharts option from common JSON shapes
    const buildEChartsOption = (data) => {
        if (!data) return null;

        // If data already looks like an ECharts option (has `series` or `xAxis`), return as-is
        if (typeof data === 'object' && (data.series || data.xAxis || data.yAxis)) {
            return data;
        }

        // { categories: [...], values: [...], type: 'bar' }
        if (data.categories && Array.isArray(data.categories) && Array.isArray(data.values)) {
            return {
                xAxis: { type: 'category', data: data.categories },
                yAxis: { type: 'value' },
                series: [
                    {
                        data: data.values,
                        type: data.type || 'bar',
                        name: data.name || undefined,
                    },
                ],
                tooltip: { trigger: 'axis' },
            };
        }

        // If chartData is an array of { name, value } -> pie chart
        if (Array.isArray(data) && data.every(item => item && item.name !== undefined && item.value !== undefined)) {
            return {
                tooltip: { trigger: 'item' },
                series: [
                    {
                        name: 'Data',
                        type: 'pie',
                        radius: '50%',
                        data: data.map(d => ({ name: d.name, value: d.value })),
                        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' } }
                    }
                ],
            };
        }

        // { labels: [...], datasets: [{ data: [...], type: 'line' }] } (common generic shape)
        if (data.labels && Array.isArray(data.labels) && Array.isArray(data.datasets)) {
            const series = data.datasets.map(ds => ({
                name: ds.label || undefined,
                type: ds.type || 'line',
                data: ds.data || [],
            }));
            return {
                xAxis: { type: 'category', data: data.labels },
                yAxis: { type: 'value' },
                series,
                tooltip: { trigger: 'axis' },
                legend: { data: series.map(s => s.name).filter(Boolean) },
            };
        }

        // Unknown shape -> return null so caller can fallback to raw JSON rendering
        return null;
    };

    const option = chartData ? buildEChartsOption(chartData) : null;

    // larger max width when there's chart data
    const bubbleMaxClass = chartData ? 'max-w-[95%] lg:max-w-[85%]' : 'max-w-[75%]';

    return (
        <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} px-2`}>
            <div
                className={`inline-block rounded-2xl px-4 py-3 ${bubbleMaxClass} whitespace-pre-wrap wrap-break-word transition-opacity duration-200 ease-out ${entered ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    backgroundColor: isUser ? 'var(--bubble-user-bg)' : 'var(--bubble-bot-bg)',
                    color: isUser ? 'var(--bubble-user-text)' : 'var(--bubble-bot-text)'
                }}
            >
                {/* Summary / human-readable text stays on top */}
                {text?.split('\n').map((line, index) => (
                    <p key={index} className="m-0">{line}</p>
                ))}

                {/* If parsed JSON exists, render chart when possible, otherwise show JSON */}
                {chartData && (
                    <div className="mt-3 rounded-md overflow-hidden">
                        {option ? (
                            <div className="p-0 rounded-md" style={{ backgroundColor: 'var(--chart-bg)' }}>
                                <ReactECharts
                                    option={option}
                                    style={{ height: 420, width: '100%' }} // increased height for readability
                                    notMerge={true}
                                />
                            </div>
                        ) : (
                            <div className="mt-3 p-3 rounded-md text-sm overflow-auto" style={{ backgroundColor: 'var(--chart-bg)', color: 'var(--text-color)' }}>
                                <div className="text-xs mb-2" style={{ color: 'var(--muted-text)' }}>Parsed JSON (no chart mapping found)</div>
                                <pre className="whitespace-pre-wrap text-[12px] m-0">{JSON.stringify(chartData, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;