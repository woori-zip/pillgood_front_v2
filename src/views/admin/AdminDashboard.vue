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
      totalSalesOptions: this.getChartOptions('month'),
      dailySalesOptions: this.getChartOptions('hour'),
      dailySubscribersOptions: this.getChartOptions('hour'),
      monthlySalesOptions: this.getChartOptions('day'),
      totalSubscribersOptions: this.getChartOptions('month'),
    };
  },
  methods: {
    getChartOptions(unit) {
      return {
        responsive: true,
        maintainAspectRatio: false,
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
    async fetchData(url, dataProp) {
      try {
        const response = await axios.get(url);
        const data = response.data.map(item => ({
          x: new Date(item[0]),
          y: item[1],
        }));
        this[dataProp] = {
          datasets: [{
            label: url.split('/').pop().replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            data: data,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        };
      } catch (error) {
        console.error(`Error fetching ${dataProp} data:`, error);
      }
    }
  },
  async mounted() {
    this.fetchData('/admin/dashboard/total-sales', 'totalSalesData');
    this.fetchData('/admin/dashboard/daily-sales', 'dailySalesData');
    this.fetchData('/admin/dashboard/daily-subscribers', 'dailySubscribersData');
    this.fetchData('/admin/dashboard/total-subscribers', 'totalSubscribersData');
    this.fetchData('/admin/dashboard/monthly-sales', 'monthlySalesData');
  },
};
</script>

<style scoped>
.chart-wrapper {
  padding: 10px;
  border-radius: 10px;
  margin-bottom: 20px;
  border: 2px solid black;
}
.chart-container {
  height: 300px;
  width: 100%;
}
</style>
