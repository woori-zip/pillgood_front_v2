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
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>&nbsp;
            <v-btn color="primary" @click="createProduct">+ 제품 등록</v-btn>&nbsp;
            <v-btn color="primary" @click="openNutrientDialog">성분 관리</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table
        :headers="headers"
        :items="filteredProducts"
        class="elevation-1 mytable"
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
        <template v-slot:[`item.productName`]="{ item }">
          <div
            @mouseover="showImage(item, $event)"
            @mouseleave="hideImage"
            @mousemove="moveImage($event)"
          >
            {{ item.productName }}
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="800px" max-height="900px">
      <AdminProductEdit :product="editingProduct" @save="onProductSave" @cancel="editDialog = false" />
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="800px" max-height="900px">
      <AdminProductCreate @save="onProductSave" @cancel="createDialog = false" />
    </v-dialog>

    <v-dialog v-model="nutrientDialog" max-width="800px" max-height="900px">
      <NutrientRelationManager @close="nutrientDialog = false" />
    </v-dialog>

    <div v-if="hoveredImage" :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }" class="image-tooltip">
      <img :src="hoveredImage" alt="Product Image" />
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import AdminProductEdit from './AdminProductEdit.vue';
import AdminProductCreate from './AdminProductCreate.vue';
import NutrientRelationManager from './NutrientRelationManager.vue';

export default {
  name: 'AdminProductList',
  components: { AdminProductEdit, AdminProductCreate, NutrientRelationManager },
  data() {
    return {
      selectedFilter: '',
      searchQuery: '',
      selectedCoupons: {},
      editDialog: false,
      createDialog: false,
      nutrientDialog: false,
      editingProduct: null,
      hoveredImage: null,
      tooltipPosition: { x: 0, y: 0 },
      headers: [
        { title: '제품명', value: 'productName', align: 'center' },
        { title: '성분', value: 'nutrient', align: 'center' },
        { title: '가격', value: 'price', align: 'center' },
        { title: '재고', value: 'stock', align: 'center' },
        { title: '대상', value: 'target', align: 'center' },
        { title: '상태', value: 'active', align: 'center' },
        { title: '관리', value: 'actions', align: 'center' },
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
    openNutrientDialog() {
      this.nutrientDialog = true;
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
    async showImage(item, event) {
      const productId = item.productId;
      try {
        const productDetails = await this.fetchProductDetails(productId);
        if (!productDetails || !productDetails.productImage) {
          throw new Error('No product description found');
        }

        const firstImage = this.extractFirstImage(productDetails.productImage);
        if (!firstImage) {
          throw new Error('No image found in the product image field');
        }

        this.hoveredImage = firstImage;
        this.tooltipPosition = { x: event.clientX + 15, y: event.clientY + 15 }; // 초기 위치 설정
      } catch (error) {
        console.error('이미지를 불러오는 데 실패했습니다:', error.message);
      }
    },
    hideImage() {
      this.hoveredImage = null;
    },
    moveImage(event) {
      this.tooltipPosition = { x: event.clientX + 15, y: event.clientY + 15 };
    },
    extractFirstImage(htmlString) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html'); 
      const imgTag = doc.querySelector('img');
      return imgTag ? imgTag.src : null;
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

.image-tooltip {
  position: fixed;
  z-index: 1000;
  border: 1px solid #ccc;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
