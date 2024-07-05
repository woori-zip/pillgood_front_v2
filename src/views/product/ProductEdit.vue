<template>
  <div class="main-container">
    <h1 class="text-melon">제품 수정</h1>
    <form @submit.prevent="handleUpdateProduct">
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
          <button type="submit" class="btn btn-green">Update Product</button>
          <button class="btn btn-gray" @click="navigateToProductList">Cancel</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue';

export default {
  name: 'ProductEdit',
  components: {
    RichTextEditor
  },
  data() {
    return {
      product: {
        productId: '', 
        productName: '',
        nutrientId: null, 
        price: '',
        stock: '',
        target: '공통',
        productImage: '', 
        active: true 
      },
      newNutrientName: '',
      newNutrientDescription: ''
    };
  },
  async created() {
    await this.fetchNutrients();
    const productId = this.$route.params.id;  // URL 매개변수로부터 productId 가져오기
    await this.loadProductDetails(productId);
  },
  computed: {
    ...mapGetters('nutrient', ['nutrients']),
    nutrientList() {
      return this.nutrients;
    },
    selectedNutrientDescription() {
      const selectedNutrient = this.nutrientList.find(nutrient => nutrient.nutrientId === this.product.nutrientId);
      return selectedNutrient ? selectedNutrient.description : '';
    }
  },
  methods: {
    ...mapActions('nutrient', ['fetchNutrients', 'createNutrient']),
    ...mapActions('product', ['updateProduct', 'fetchProductDetails']),
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
        const newNutrient = await this.createNutrient({
          nutrientName: this.newNutrientName,
          description: this.newNutrientDescription
        });
        this.product.nutrientId = newNutrient.nutrientId;
        alert('새로운 영양제 등록 성공');
        await this.fetchNutrients();
      } catch (error) {
        console.error('새로운 영양제 등록 실패:', error);
        alert('새로운 영양제를 등록하는 데 실패했습니다.');
      }
    },
    async handleUpdateProduct() {
      try {
        await this.updateProduct(this.product);
        this.navigateToProductList();
      } catch (error) {
        console.error('제품 수정 실패:', error);
      }
    },
    navigateToProductList() {
      this.$router.push('/productlist');
    },
    async loadProductDetails(productId) {
      try {
        const product = await this.fetchProductDetails(productId);
        this.product = {
          productId: productId,
          productName: product.productName,
          nutrientId: product.nutrientId,
          price: product.price,
          stock: product.stock,
          target: product.target,
          productImage: product.productImage,
          active: product.active
        };
      } catch (error) {
        console.error('제품 정보를 불러오는 데 실패했습니다:', error);
      }
    }
  }
};
</script>
