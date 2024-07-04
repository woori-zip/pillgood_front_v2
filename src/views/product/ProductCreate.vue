<template>
  <div class="main-container">
    <h1 class="text-melon">상품등록</h1>
    <form @submit.prevent="handleCreateProduct">
      <table style="width: 100%">
        <tr>
          <td>제품명:</td>
          <td><input v-model="product.productName" type="text" required /></td>
        </tr>
        <tr>
          <td>영양제:</td>
          <td class="select-input-flex" style="display:flex">
            <select v-model="product.nutrientId" @change="handleNutrientChange">
              <option :value="null" selected>선택 안 함</option>
              <option style="color:red;" :value="'new'">+ Add New Nutrient</option>
              <option v-for="nutrient in nutrients" :key="nutrient.nutrientId" :value="nutrient.nutrientId">
                {{ nutrient.nutrientName }}
              </option>
            </select>
            <input v-if="product.nutrientId === 'new'" v-model="newNutrientName" type="text" placeholder="Enter Nutrient Name" />
            <input v-if="product.nutrientId === 'new'" v-model="newNutrientDescription" type="text" placeholder="Enter Nutrient Description" />
            <input v-else type="text" :value="selectedNutrientDescription" disabled />
            <button class="small-btn" v-if="product.nutrientId === 'new'" type="button" @click="saveNewNutrient">Save</button>
          </td>
        </tr>
        <tr>
          <td>가격:</td>
          <td><input v-model="product.price" type="number" required /></td>
          <!-- <td>상태:</td>
          <td><input v-model="product.active" type="number" required /></td> -->
        </tr>
        <tr>
          <td>재고:</td>
          <td><input v-model="product.stock" type="number" required /></td>
        </tr>
        <tr>
          <td>대상:</td>
          <td>
            <select v-model="product.target" required>
              <option value="공통">공통</option>
              <option value="여성">여성</option>
              <option value="남성">남성</option>
            </select>
          </td>
        </tr>
      </table>
      <RichTextEditor v-model="product.productImage" contentType="html"/>
      <div class="box-container">
        <div class="btn-container">
          <button type="submit" class="btn btn-green">Create Product</button>
          <button class="btn btn-gray" @click="navigateToProductList">Cancel</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue'

export default {
  name: 'ProductCreate',
  components: {
    RichTextEditor
  },
  data() {
    return {
      product: {
        productName: '',
        nutrientId: null, 
        price: '',
        stock: '',
        target: '공통',
        productImage: '', 
        active: true 
      },
      newNutrientName: '', // 새로 추가되는 nutrient name
      newNutrientDescription: '' // 새로 추가되는 nutrient description
    };
  },
  async created() {
    await this.fetchNutrients();
  },
  computed: {
    ...mapGetters('nutrient', ['nutrients']),
    nutrientList() {
      console.log('nutrients 상태:', this.nutrients); // nutrients 상태 로그
      return this.nutrients;
    },
    selectedNutrientDescription() {
      const selectedNutrient = this.nutrientList.find(nutrient => nutrient.nutrientId === this.product.nutrientId);
      return selectedNutrient ? selectedNutrient.description : '';
    }
  },
  methods: {
    ...mapActions('nutrient', ['fetchNutrients', 'createNutrient']),
    ...mapActions('product', ['createProduct']),
    handleNutrientChange() {
      if (this.product.nutrientId !== 'new') {
        this.newNutrientName = '';
        this.newNutrientDescription = '';
      }
    },
    async saveNewNutrient() {
      if (!this.newNutrientName || !this.newNutrientDescription) {
        alert('영양제와 효능을 입력해주세요');
        return;
      }

      try {
        console.log('새 영양소 저장 시도:', { nutrientName: this.newNutrientName, description: this.newNutrientDescription });
        const newNutrient = await this.createNutrient({
          nutrientName: this.newNutrientName,
          description: this.newNutrientDescription
        });
        console.log('새로운 영양제 등록 응답:', newNutrient); // 생성 응답 로그 추가
        this.product.nutrientId = newNutrient.nutrientId;
        alert('새로운 영양제 등록 성공');
        await this.fetchNutrients(); // 새로운 영양소 목록을 다시 가져옵니다.
      } catch (error) {
        console.error('새로운 영양제 등록 실패:', error);
        alert('새로운 영양제를 등록하는 데 실패했습니다.');
      }
    },
    async handleCreateProduct() {
      try {
        console.log('폼 제출 전 제품 정보:', this.product); // 폼 제출 전 데이터 확인
        await this.createProduct(this.product);
        console.log('제품 등록 완료');
        this.navigateToProductList(); // 등록 성공 후 제품 목록 페이지로 이동
      } catch (error) {
        console.error('제품 등록 실패:', error);
      }
    },
    navigateToProductList() {
      this.$router.push('/productlist');
    }
  }
};
</script>


<style>

</style>