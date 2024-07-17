<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">제품 등록</span>
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleCreateProduct">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="product.productName" label="제품명" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="product.nutrientId"
              :items="nutrientItems"
              item-text="title"
              item-value="value"
              label="영양제"
              dense
              required
              @change="handleNutrientChange"
            ></v-select>
          </v-col>
          <v-col v-if="product.nutrientId === 'new'" cols="12" sm="6">
            <v-text-field
              v-model="newNutrientName"
              label="Enter Nutrient Name"
              required
            ></v-text-field>
          </v-col>
          <v-col v-if="product.nutrientId === 'new'" cols="12" sm="6">
            <v-text-field
              v-model="newNutrientDescription"
              label="Enter Nutrient Description"
              required
            ></v-text-field>
          </v-col>
          <v-col v-if="product.nutrientId === 'new'" cols="12" sm="6">
            <v-btn @click="saveNewNutrient">Save</v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="product.price" label="가격" type="number" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="product.stock" label="재고" type="number" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="product.target"
              :items="[{ title: '공통', value: '공통' }, { title: '여성', value: '여성' }, { title: '남성', value: '남성' }]"
              item-text="title"
              item-value="value"
              label="대상"
              dense
              required
            ></v-select>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <RichTextEditor v-model="product.productImage" />
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">저장</v-btn>
          <v-btn color="grey" @click="closeDialog">취소</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue'

export default {
  name: 'AdminProductCreate',
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
      newNutrientName: '',
      newNutrientDescription: ''
    };
  },
  computed: {
    ...mapGetters('nutrient', ['nutrients']),
    nutrientItems() {
      return this.nutrients.map(nutrient => ({
        title: nutrient.nutrientName,
        value: nutrient.nutrientId
      })).concat({ title: '+ Add New Nutrient', value: 'new' });
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
        const newNutrient = await this.createNutrient({
          nutrientName: this.newNutrientName,
          description: this.newNutrientDescription
        });
        this.product.nutrientId = newNutrient.nutrientId;
        alert('새로운 영양제 등록 성공');
        await this.fetchNutrients();
      } catch (error) {
        alert('새로운 영양제를 등록하는 데 실패했습니다.');
      }
    },
    async handleCreateProduct() {
      try {
        await this.createProduct(this.product);
        this.$emit('save');
      } catch (error) {
        console.error('제품 등록 실패:', error);
      }
    },
    closeDialog() {
      this.$emit('cancel');
    }
  },
  async created() {
    await this.fetchNutrients();
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}
</style>
