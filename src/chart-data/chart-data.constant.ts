export const CHART_EVENT = {
  connect: 'connect',
  chartData: 'chart-data',
};

export const CHART_DATA_HOOKS = {
  afterChartDataChanged: 'afterChartDataChanged',
};

export const defaultHooks = () => ({
  [CHART_DATA_HOOKS.afterChartDataChanged]: [],
});
