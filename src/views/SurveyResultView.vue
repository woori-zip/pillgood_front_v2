<template>
  <div class="main-container">
    <div v-if="isLoading" class="loading">Loading...</div>
    <div v-else class="box-container box-shadow">
      <h4 class="text-melon">{{ surveyResult?.name }} 님의 설문 조사 결과</h4>
      <div v-if="surveyResult">
        <table class="result-table table-borderless">
          <tr>
            <td>{{ surveyResult.age }} 세 | 
              ( {{ genderDisplay }} ) | 
              {{ surveyResult.height }} cm / {{ surveyResult.weight }} kg
              ( BMI: {{ calculateBMI(surveyResult.weight, surveyResult.height) }} )</td>
          </tr>
        </table>
        <div class="def-container">
          <div v-for="(deficiency, index) in uniqueDeficiencies" :key="index" class="def-id box-shadow">
            <h2>#{{ getDeficiencyName(deficiency) }}</h2>
          </div>
        </div>
        <h4 class="text-melon">{{ surveyResult?.name }} 님을 위한 추천 제품</h4>
        <div class="product-container">
          <div v-for="(product, index) in recommendedProducts" :key="index" class="product-grid-item">
            <div class="product-item box-shadow">
              <router-link :to="{ name: 'ProductDetail', params: { id: product.productId } }">
                <img :src="product.productImage" alt="productImg" class="product-image">
                <h5>{{ product.productName }}</h5>
              </router-link>
              <button 
                :disabled="isAddedToCart[product.productId]"
                @click="addToCart(product.productId)"
                class="btn btn-green">
                {{ isAddedToCart[product.productId] ? "담겼습니다 ✅" : "장바구니에 담기" }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>설문 결과를 불러오는 중입니다...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, reactive } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'SurveyResultView',
  setup() {
    const store = useStore();
    const router = useRouter();
    const isLoading = computed(() => store.state.survey.isLoading);
    const surveyResult = computed(() => store.getters['survey/surveyResult']);
    const recommendedProducts = computed(() => store.getters['survey/recommendedProducts']);
    const deficiencies = computed(() => store.getters['deficiency/deficiencies']);
    const isAddedToCart = reactive({});

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

    const genderDisplay = computed(() => {
      if (surveyResult.value?.gender === 'M') return '남';
      if (surveyResult.value?.gender === 'F') return '여';
      return '';
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
      await store.dispatch('survey/fetchProductsByDeficiency', uniqueDeficiencies.value);
      await store.dispatch('product/fetchProducts');

      console.log('recommendedProducts from surveyResult:', surveyResult.value.recommendedProducts);
      // recommendedProducts를 로그로 출력하여 값이 제대로 설정되었는지 확인
      const recommendedProducts = store.getters['survey/recommendedProducts'];
      console.log('recommendedProducts after fetch:', recommendedProducts);
    });

    const addToCart = async (productId) => {
      try {
        const cartItem = {
          productId,
          productQuantity: 1
        };
        const response = await store.dispatch('cart/addToCart', cartItem);
        if (response.status === 201) {
          isAddedToCart[productId] = true;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    };

    return {
      isLoading,
      surveyResult,
      recommendedProducts,
      calculateBMI,
      getDeficiencyName,
      uniqueDeficiencies,
      genderDisplay,
      isAddedToCart,
      addToCart
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
  margin-bottom: 30px;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.def-id {
  background-color: #B4D9A9;
  padding: 10px;
  text-align: center;
  border-radius: 30px; /* 둥근 모서리 추가 */
}

.def-id h2 {
  color: white;
  margin: 0;
}

.product-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px;
}

.product-grid-item {
  display: flex;
  justify-content: center;
}

.product-item {
  width: 100%;
  padding: 7px;
  text-align: center;
}

.product-image {
  width: 100%;
  height: auto;
  display: block;
  margin-bottom: 10px;
}

.btn {
  margin-top: 10px;
}

/* 반응형 디자인을 위한 미디어 쿼리 */
@media (max-width: 600px) {
  .def-container {
    grid-template-columns: 1fr; /* 화면이 좁아지면 세로 배열 */
  }
}
</style>


