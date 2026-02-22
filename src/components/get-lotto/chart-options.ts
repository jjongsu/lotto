import type { EChartsOption } from 'echarts';
import type { TopFrequencyItem } from '../../utils/get-lotto-stats';

const createCommonChartOption = (): Pick<EChartsOption, 'backgroundColor' | 'textStyle' | 'animationDuration' | 'animationDurationUpdate'> => {
    return {
        backgroundColor: 'transparent',
        textStyle: {
            color: '#2f4f6c',
            fontFamily: 'var(--font-lotto-body), Noto Sans KR, sans-serif',
            fontSize: 12,
        },
        animationDuration: 360,
        animationDurationUpdate: 220,
    };
};

export const createBarChartOption = ({
    data,
    color,
    labelPrefix,
}: {
    data: TopFrequencyItem[];
    color: string;
    labelPrefix: string;
}): EChartsOption => {
    const common = createCommonChartOption();
    const categories = data.map((item) => `${labelPrefix} ${item.number}`);

    return {
        ...common,
        grid: { left: 14, right: 14, top: 30, bottom: 18, containLabel: true },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(243, 250, 255, 0.95)',
            borderColor: 'rgba(126, 172, 204, 0.55)',
            textStyle: { color: '#1f4060' },
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                interval: 0,
                rotate: data.length > 7 ? 24 : 0,
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(107, 149, 184, 0.65)',
                },
            },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            splitLine: {
                lineStyle: {
                    color: 'rgba(126, 163, 198, 0.24)',
                },
            },
        },
        series: [
            {
                type: 'bar',
                data: data.map((item) => item.count),
                barWidth: '58%',
                itemStyle: {
                    color,
                    borderRadius: [7, 7, 2, 2],
                },
            },
        ],
        media: [
            {
                query: { maxWidth: 420 },
                option: {
                    grid: { left: 8, right: 10, top: 28, bottom: 18, containLabel: true },
                    xAxis: {
                        axisLabel: {
                            interval: 'auto',
                            rotate: 32,
                            fontSize: 10,
                        },
                    },
                    yAxis: {
                        axisLabel: {
                            fontSize: 10,
                        },
                    },
                },
            },
        ],
    };
};

export const createPieChartOption = ({
    data,
    colors,
}: {
    data: Array<{ name: string; value: number }>;
    colors: string[];
}): EChartsOption => {
    const common = createCommonChartOption();

    return {
        ...common,
        color: colors,
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(243, 250, 255, 0.95)',
            borderColor: 'rgba(126, 172, 204, 0.55)',
            textStyle: { color: '#1f4060' },
        },
        legend: {
            bottom: 4,
            left: 'center',
            itemWidth: 10,
            itemHeight: 10,
            textStyle: {
                color: '#35516d',
                fontSize: 12,
            },
        },
        series: [
            {
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                label: {
                    formatter: '{b}\n{d}%',
                    color: '#2c4c68',
                    fontSize: 12,
                },
                data,
            },
        ],
        media: [
            {
                query: { maxWidth: 420 },
                option: {
                    legend: {
                        bottom: -2,
                        textStyle: {
                            fontSize: 11,
                        },
                    },
                    series: [
                        {
                            center: ['50%', '42%'],
                            radius: ['42%', '66%'],
                            label: {
                                fontSize: 10,
                            },
                        },
                    ],
                },
            },
        ],
    };
};

export const createLineChartOption = ({
    draws,
    sums,
    average,
}: {
    draws: string[];
    sums: number[];
    average: number;
}): EChartsOption => {
    const common = createCommonChartOption();

    return {
        ...common,
        grid: { left: 14, right: 14, top: 36, bottom: 24, containLabel: true },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(243, 250, 255, 0.95)',
            borderColor: 'rgba(126, 172, 204, 0.55)',
            textStyle: { color: '#1f4060' },
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: draws,
            axisLine: {
                lineStyle: {
                    color: 'rgba(107, 149, 184, 0.65)',
                },
            },
        },
        yAxis: {
            type: 'value',
            splitLine: {
                lineStyle: {
                    color: 'rgba(126, 163, 198, 0.24)',
                },
            },
        },
        series: [
            {
                type: 'line',
                smooth: true,
                data: sums,
                showSymbol: false,
                lineStyle: {
                    width: 2.2,
                    color: '#3c9fda',
                },
                areaStyle: {
                    color: 'rgba(113, 201, 233, 0.26)',
                },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    lineStyle: {
                        color: 'rgba(227, 140, 67, 0.85)',
                        type: 'dashed',
                    },
                    data: [{ yAxis: average, name: '평균' }],
                    label: {
                        formatter: '평균 {c}',
                        color: '#7b4f1f',
                    },
                },
            },
        ],
        media: [
            {
                query: { maxWidth: 420 },
                option: {
                    grid: { left: 8, right: 10, top: 30, bottom: 18, containLabel: true },
                    xAxis: {
                        axisLabel: {
                            fontSize: 10,
                            interval: 'auto',
                        },
                    },
                    yAxis: {
                        axisLabel: {
                            fontSize: 10,
                        },
                    },
                },
            },
        ],
    };
};

export const CHART_STYLE = {
    width: '100%',
    height: '100%',
} as const;
