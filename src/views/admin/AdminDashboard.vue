<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="chart-wrapper">
          <line-chart v-if="totalSalesData" :chartData="totalSalesData" :options="totalSalesOptions"></line-chart>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="chart-wrapper">
          <line-chart v-if="dailySalesData" :chartData="dailySalesData" :options="dailySalesOptions"></line-chart>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="chart-wrapper">
          <line-chart v-if="dailySubscribersData" :chartData="dailySubscribersData" :options="dailySubscribersOptions"></line-chart>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="chart-wrapper">
          <line-chart v-if="monthlySalesData" :chartData="monthlySalesData" :options="monthlySalesOptions"></line-chart>
        </div>
      </v-col>
      <v-col cols="6" md="3">
        <div class="chart-wrapper">
          <line-chart v-if="totalSubscribersData" :chartData="totalSubscribersData" :options="totalSubscribersOptions"></line-chart>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import LineChart from '@/components/LineChart.vue';
import axios from 'axios';

export default {
  name: 'AdminDashboard',
  components: {
    LineChart,
  },
  data() {
    return {
      totalSalesData: null,
      dailySalesData: null,
      dailySubscribersData: null,
      totalSubscribersData: null,
      monthlySalesData: null,
      totalSalesOptions: this.getChartOptions('month', '월별 매출 추이'),
      dailySalesOptions: this.getChartOptions('hour', '일 매출 추이'),
      dailySubscribersOptions: this.getChartOptions('hour', '일 구독자 추이'),
      monthlySalesOptions: this.getChartOptions('day', '월 매출 추이'),
      totalSubscribersOptions: this.getChartOptions('month', '월별 구독자 추이'),
    };
  },
  methods: {
    getChartOptions(unit, title) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: title,
            color: '#94b58b',
            font: {
              size: 20,
              family: 'Arial',
              weight: 'bold'
            }
          },
          legend: {
            display: false,  // 범례를 숨깁니다.
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: unit,
              stepSize: unit === 'hour' ? 2 : 1,
              displayFormats: {
                hour: 'HH:mm',
                day: 'MM-dd',
                month: 'MMM'
              },
            },
            grid: {
              display: false,
            },
            ticks: {
              color: 'black',
              maxTicksLimit: 3,
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: 'black',
              callback: function(value, index, values) {
                const maxValue = Math.max(...values.map(v => v.value));
                return value === maxValue ? value : '';
              }
            },
          },
        },
      };
    },
    async fetchData(url, dataProp, title) {
      try {
        const response = await axios.get(url);
        const data = response.data.map(item => ({
          x: new Date(item[0]),
          y: item[1],
        }));
        this[dataProp] = {
          datasets: [{
            label: title,
            data: data,
            backgroundColor: 'rgba(190, 198, 160, 0.5)',
            borderColor: '#708871',
            borderWidth: 2,
            fill: true
          }],
        };
      } catch (error) {
        console.error(`Error fetching ${dataProp} data:`, error);
      }
    }
  },
  async mounted() {
    this.fetchData('/admin/dashboard/total-sales', 'totalSalesData', '월 판매량');
    this.fetchData('/admin/dashboard/daily-sales', 'dailySalesData', '1시간 판매량');
    this.fetchData('/admin/dashboard/daily-subscribers', 'dailySubscribersData', '1시간 구독자');
    this.fetchData('/admin/dashboard/total-subscribers', 'totalSubscribersData', '이번달 총 구독자 수');
    this.fetchData('/admin/dashboard/monthly-sales', 'monthlySalesData', '일일 총 판매량');
  },
};
</script>

<style scoped>
.chart-wrapper {
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 2px solid gray;
}
.chart-container {
  height: 300px;
  width: 100%;
}
</style>
