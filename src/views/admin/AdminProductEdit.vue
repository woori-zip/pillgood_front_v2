<template>
  <v-card>
    <v-card-title>
      <span class="text-h5">제품 수정</span>
    </v-card-title>
    <v-card-text>
      <v-form @submit.prevent="handleUpdateProduct">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field v-model="localProduct.productName" label="제품명" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="localProduct.nutrientId"
              :items="nutrientItems"
              item-text="title"
              item-value="value"
              label="영양제"
              dense
              required
              @change="handleNutrientChange"
            ></v-select>
          </v-col>
          <v-col v-if="localProduct.nutrientId === 'new'" cols="12" sm="5">
            <v-text-field
              v-model="newNutrientName"
              label="Enter Nutrient Name"
              required
            ></v-text-field>
          </v-col>
          <v-col v-if="localProduct.nutrientId === 'new'" cols="12" sm="5">
            <v-text-field
              v-model="newNutrientDescription"
              label="Enter Nutrient Description"
              required
            ></v-text-field>
          </v-col>
          <v-col v-if="localProduct.nutrientId === 'new'" cols="12" sm="2">
            <v-btn @click="saveNewNutrient">Save</v-btn>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="localProduct.price" label="가격" type="number" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="localProduct.stock" label="재고" type="number" required></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="localProduct.target"
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
            <RichTextEditor v-model="localProduct.productImage" @update:modelValue="onProductImageUpdate" />
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="handleUpdateAndSaveProduct">저장</v-btn>
          <v-btn color="grey" @click="cancel">취소</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import RichTextEditor from '@/components/RichTextEditor.vue';

export default {
  name: 'AdminProductEdit',
  components: {
    RichTextEditor
  },
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localProduct: { ...this.product },
      newNutrientName: '',
      newNutrientDescription: '',
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
    ...mapActions('product', ['updateProduct']),
    handleNutrientChange() {
      if (this.localProduct.nutrientId !== 'new') {
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
        this.localProduct.nutrientId = newNutrient.nutrientId;
        alert('새로운 영양제 등록 성공');
        await this.fetchNutrients();
      } catch (error) {
        alert('새로운 영양제를 등록하는 데 실패했습니다.');
      }
    },
    async handleUpdateProduct() {
      try {
        console.log('Local Product before update:', this.localProduct);
        await this.updateProduct(this.localProduct);
        console.log('Product updated successfully');
      } catch (error) {
        console.error('제품 수정 실패:', error);
      }
    },
    async handleUpdateAndSaveProduct() {
      console.log('Save button clicked');
      await this.handleUpdateProduct();
      console.log('Emitting save event');
      this.$emit('save');
    },
    async onProductImageUpdate(value) {
      console.log('Product image updated:', value);
      this.localProduct.productImage = value;
    },
    cancel() {
      console.log('Cancel button clicked');
      this.$emit('cancel');
    }
  }
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.text-melon {
  color: #ff6f61;
}

.small-btn {
  margin-right: 5px;
}

.line-table {
  width: 100%;
  border-collapse: collapse;
}

.line-table th, .line-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.line-table th {
  background-color: #f2f2f2;
  text-align: left;
}

.line-table tr:hover {
  background-color: #f1f1f1;
}
</style>
