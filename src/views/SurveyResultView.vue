<template>
  <div class="main-container">
    <h4 class="text-melon">{{ surveyResult?.name }} 님의 설문 조사 결과</h4>
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="box-container box-shadow">
      <div v-if="surveyResult">
        <table class="result-table table-borderless">
          <tr>
            <td>나이</td>
            <td>{{ surveyResult.age }}</td>
          </tr>
          <tr>
            <td>성별</td>
            <td>{{ surveyResult.gender }}</td>
          </tr>
          <tr>
            <td>키 (cm)</td>
            <td>{{ surveyResult.height }}</td>
          </tr>
          <tr>
            <td>몸무게 (kg)</td>
            <td>{{ surveyResult.weight }}</td>
          </tr>
          <tr>
            <td>신체질량지수 (BMI)</td>
            <td>{{ calculateBMI(surveyResult.weight, surveyResult.height) }}</td>
          </tr>
        </table>
        <div class="def-container box-shadow">
          <div v-for="(deficiency, index) in uniqueDeficiencies" :key="index" class="def-id box-shadow">
            <h2>#{{ getDeficiencyName(deficiency) }}</h2>
          </div>
        </div>
        <table class="line-table">
          <th>
            {{ surveyResult?.name }} 님을 위한 추천 제품
          </th>
          <tr v-for="(product, index) in recommendedProducts" :key="index">
            <h5><router-link :to="{ name: 'ProductDetail', params: { id: product.productId } }">{{ product.productName }}</router-link></h5>
          </tr>
        </table>
      </div>
      <div v-else>
        <p>설문 결과를 불러오는 중입니다...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'SurveyResultView',
  setup() {
    const store = useStore();
    const router = useRouter();
    const isLoading = computed(() => store.state.survey.isLoading);
    const surveyResult = computed(() => store.getters['survey/surveyResult']);
    const recommendedProducts = computed(() => store.getters['product/products']);
    const deficiencies = computed(() => store.getters['deficiency/deficiencies']);

    const calculateBMI = (weight, height) => {
      if (!weight || !height) return 'N/A';
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(2);
    };

    const getDeficiencyName = (id) => {
      const deficiency = deficiencies.value?.find(def => def.deficiencyId === id);
      return deficiency ? deficiency.deficiencyName : 'Unknown';
    };

    const uniqueDeficiencies = computed(() => {
      const ids = [surveyResult.value?.deficiencyId1, surveyResult.value?.deficiencyId2, surveyResult.value?.deficiencyId3];
      return [...new Set(ids)]; // 중복 제거
    });

    onMounted(async () => {
      const memberId = store.state.member.memberId;
      console.log('memberId:', memberId);
      await store.dispatch('survey/loadSurveyResult', memberId);
      console.log('surveyResult:', surveyResult.value);

      if (!surveyResult.value) {
        alert("설문 결과가 없습니다!");
        router.push("/survey");
        return;
      }

      // Deficiencies and Products Fetch
      await store.dispatch('deficiency/fetchDeficiencies');
      const deficiencyIds = uniqueDeficiencies.value;
      await store.dispatch('product/fetchProductsByDeficiency', deficiencyIds);
      console.log('recommendedProducts:', recommendedProducts.value);
    });

    return {
      isLoading,
      surveyResult,
      recommendedProducts,
      calculateBMI,
      getDeficiencyName,
      uniqueDeficiencies
    };
  }
};
</script>

<style scoped>
@import '../assets/styles.css';

.result-table {
  border: 0;
}
.def-container {
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 10px;
}

.def-id {
  background-color: #B4D9A9;
  margin: 10px auto;
  padding: 10px;
  width: 200px;
}

.def-id h2 {
  color: white;
}

</style>