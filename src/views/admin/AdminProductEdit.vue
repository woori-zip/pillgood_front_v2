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
            ></v-select>
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
            <RichTextEditor v-model="localProduct.productImage" />
          </v-col>
        </v-row>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" type="submit">저장</v-btn>
          <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
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
      localProduct: { ...this.product }
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
    ...mapActions('product', ['updateProduct']),
    async handleUpdateProduct() {
      if (this.localProduct.nutrientId === 'new') {
        alert('새 영양제를 저장 후 다시 시도해주세요.');
        return;
      }
      try {
        await this.updateProduct(this.localProduct);
        this.$emit('save');
      } catch (error) {
        console.error('제품 수정 실패:', error);
      }
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
