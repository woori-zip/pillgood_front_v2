<template>
  <v-container class="main-container box-shadow">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">제품 목록</h1>
      </v-card-title>

      <v-card-subtitle>
        <v-row align="center">
          <v-col cols="12" sm="3">
            <v-select
              v-model="selectedFilter"
              :items="filters"
              item-text="title"
              item-value="value"
              label="필터 선택"
              dense
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="searchQuery"
              :disabled="!selectedFilter"
              label="검색어를 입력하세요"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="3">
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>
            <v-btn color="primary" @click="createProduct">+ 제품 등록</v-btn>
            <v-btn color="primary" @click="editNutrient">성분 관리</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        class="elevation-1"
      >
        <template v-slot:[`item.nutrient`]="{ item }">
          <span>{{ getNutrientName(item.nutrientId) }}</span>
        </template>
        <template v-slot:[`item.active`]="{ item }">
          <v-select
            v-model="item.active"
            :items="[{ title: '활성', value: true }, { title: '비활성', value: false }]"
            label="상태"
            dense
          ></v-select>
          <v-btn color="success" @click="confirmUpdateStatus(item)">확인</v-btn>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditDialog(item)">수정</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="800px">
      <AdminProductEdit :product="editingProduct" @save="onProductSave" @cancel="editDialog = false" />
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="800px">
      <AdminProductCreate @save="onProductSave" @cancel="createDialog = false" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import AdminProductEdit from './AdminProductEdit.vue';
import AdminProductCreate from './AdminProductCreate.vue';

export default {
  name: 'AdminProductList',
  components: { AdminProductEdit, AdminProductCreate },
  data() {
    return {
      selectedFilter: '',
      searchQuery: '',
      selectedCoupons: {},
      editDialog: false,
      createDialog: false,
      editingProduct: null,
      headers: [
        { title: '제품명', value: 'productName' },
        { title: '성분', value: 'nutrient' },
        { title: '가격', value: 'price' },
        { title: '재고', value: 'stock' },
        { title: '대상', value: 'target' },
        { title: '상태', value: 'active' },
        { title: '관리', value: 'actions' },
      ],
      filters: [
        { title: '제품명', value: 'productName' },
        { title: '성분', value: 'nutrient' },
        { title: '대상', value: 'target' },
      ]
    };
  },
  computed: {
    ...mapGetters('product', ['products']),
    ...mapGetters('nutrient', ['nutrients']),
    ...mapState('member', ['isAdmin']),
    filteredProducts() {
      let products = this.products;

      if (this.selectedFilter && this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        products = products.filter(product => {
          if (this.selectedFilter === 'productName') {
            return product.productName && product.productName.toLowerCase().includes(query);
          } else if (this.selectedFilter === 'nutrient') {
            const nutrientName = this.getNutrientName(product.nutrientId);
            return nutrientName && nutrientName.toLowerCase().includes(query);
          } else if (this.selectedFilter === 'target') {
            return product.target && product.target.toLowerCase().includes(query);
          }
          return true;
        });
      }

      return products.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    }
  },
  async created() {
    await this.checkLoginStatus();
    await this.fetchProducts();
    await this.fetchNutrients();
  },
  methods: {
    ...mapActions('member', ['checkLoginStatus']),
    ...mapActions('product', ['fetchProducts', 'updateProductStatus', 'fetchProductDetails']),
    ...mapActions('nutrient', ['fetchNutrients']),
    getNutrientName(nutrientId) {
      const nutrient = this.nutrients.find(n => n.nutrientId === nutrientId);
      return nutrient ? nutrient.nutrientName : 'Unknown';
    },
    openEditDialog(product) {
      this.editingProduct = { ...product };
      this.editDialog = true;
    },
    openCreateDialog() {
      this.createDialog = true;
    },
    onProductSave() {
      this.editDialog = false;
      this.createDialog = false;
      this.fetchProducts(); // 데이터 새로고침
    },
    async confirmUpdateStatus(product) {
      try {
        const response = await this.updateProductStatus({ productId: product.productId, active: product.active });
        if (response && response.status === 200) {
          alert('제품 상태가 업데이트되었습니다.');
        } else {
          alert('제품 상태 업데이트에 실패했습니다.');
        }
      } catch (error) {
        alert('상태 변경에 실패했습니다.');
      }
    },
    resetFilters() {
      this.selectedFilter = '';
      this.searchQuery = '';
    },
    createProduct() {
      this.openCreateDialog();
    },
    editNutrient() {
      this.$router.push('/nutrientedit');
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
