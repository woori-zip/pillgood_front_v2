<template>
  <div class="album py-5 bg-body-tertiary">
    <div class="container">
      <h2 class="text-melon">Product List</h2>
      <!-- Tabs -->
      <div class="tabs">
        <button @click="setActiveTab('all')" :class="{ active: activeTab === 'all' }">전체</button>
        <button @click="setActiveTab('nutrients')" :class="{ active: activeTab === 'nutrients' }">성분별</button>
        <button @click="setActiveTab('deficiencies')" :class="{ active: activeTab === 'deficiencies' }">고민별</button>
        <button @click="setActiveTab('targets')" :class="{ active: activeTab === 'targets' }">대상별</button>
      </div>
      <!-- Sort Dropdown -->
      <div class="sort-dropdown">
        <label for="sortSelect">정렬:</label>
        <select id="sortSelect" v-model="sortType" @change="sortProducts">
          <option value="all">전체</option>
          <option value="latest">최신순</option>
          <option value="topSelling">판매순</option>
        </select>
      </div>
      <!-- Nutrient Filter Buttons -->
      <div v-if="activeTab === 'nutrients'" class="btn-container">
        <button v-for="nutrient in nutrients" :key="nutrient.nutrientId" @click="filterByNutrient(nutrient.nutrientId)" class="btn btn-gray">
          {{ nutrient.nutrientName }}
        </button>
      </div>
      <!-- Deficiency Filter Buttons -->
      <div v-if="activeTab === 'deficiencies'" class="btn-container">
        <button v-for="deficiency in uniqueDeficiencies" :key="deficiency" @click="filterByDeficiency(deficiency)" class="btn btn-gray">
          {{ deficiency }}
        </button>
      </div>
      <!-- Target Filter Buttons -->
      <div v-if="activeTab === 'targets'" class="btn-container">
        <button v-for="target in targets" :key="target" @click="filterByTarget(target)" class="btn btn-gray">
          {{ target }}
        </button>
      </div>
      <!-- Tab Content -->
      <div class="row">
        <div class="col-lg-2 col-md-4 col-sm-6 text-center mb-3" v-for="product in filteredProducts" :key="product.productId">
          <div class="card">
            <img @click="viewProduct(product.productId)" :src="product.productImage" class="card-img-top" alt="Product Image">
            <div class="card-body">
              <h6 class="card-title">{{ product.productName }}</h6>
              <p class="card-text">{{ product.price }}원</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions, mapGetters } from 'vuex';
import '../assets/styles.css';

export default {
  name: 'ProductList',
  data() {
    return {
      products: [],
      nutrients: [],
      deficiencies: [],
      targets: [],
      selectedNutrient: null,
      selectedDeficiency: null,
      selectedTarget: null,
      activeTab: 'all',
      sortType: 'all'
    };
  },
  computed: {
    ...mapGetters('product', ['topSellingProducts', 'latestProducts']),
    filteredProducts() {
      let filtered = this.products;

      if (this.activeTab === 'nutrients' && this.selectedNutrient) {
        filtered = filtered.filter(product => product.nutrientId === this.selectedNutrient);
      } else if (this.activeTab === 'deficiencies' && this.selectedDeficiency) {
        const relevantNutrientIds = this.deficiencies
          .filter(d => d.deficiencyName === this.selectedDeficiency)
          .map(d => d.nutrientId);
        filtered = filtered.filter(product => relevantNutrientIds.includes(product.nutrientId));
      } else if (this.activeTab === 'targets' && this.selectedTarget) {
        filtered = filtered.filter(product => product.target === this.selectedTarget);
      }

      const searchQuery = this.$route.query.search?.toLowerCase() || '';
      if (searchQuery) {
        filtered = filtered.filter(product =>
          product.productName.toLowerCase().includes(searchQuery)
        );
      }

      if (this.sortType === 'latest') {
        return this.latestProducts;
      } else if (this.sortType === 'topSelling') {
        return this.topSellingProducts;
      }

      return filtered;
    },
    uniqueDeficiencies() {
      const deficiencyNames = this.deficiencies.map(d => d.deficiencyName);
      return [...new Set(deficiencyNames)];
    }
  },
  methods: {
    ...mapActions('product', ['fetchTopSellingProducts', 'fetchLatestProducts']),
    async fetchProducts() {
      try {
        const response = await axios.get('/api/products/list');
        this.products = response.data;

        for (let product of this.products) {
          await this.fetchProductImage(product);
        }

        this.targets = [...new Set(this.products.map(product => product.target))].filter(Boolean);

        console.log('Fetched products with images:', this.products);
        console.log('Extracted targets:', this.targets);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    },
    async fetchNutrients() {
      try {
        const response = await axios.get('/api/nutrients/list');
        this.nutrients = response.data;
        console.log('Fetched nutrients:', this.nutrients);
      } catch (error) {
        console.error('Error fetching nutrients:', error);
      }
    },
    async fetchDeficiencies() {
      try {
        const response = await axios.get('/api/deficiencies/nutrients');
        console.log('고민 응답:', response);
        this.deficiencies = response.data;
        console.log('Fetched deficiencies:', this.deficiencies);
      } catch (error) {
        console.error('Error fetching deficiencies:', error);
      }
    },
    async fetchProductImage(product) {
      try {
        const response = await axios.get(`/api/products/detail/${product.productId}`);
        product.productImage = this.extractFirstImage(response.data.productImage);
      } catch (error) {
        console.error(`Error fetching image for product ID ${product.productId}:`, error);
        product.productImage = null;
      }
    },
    viewProduct(productId) {
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    },
    extractFirstImage(htmlString) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const imgTag = doc.querySelector('img');
      return imgTag ? imgTag.src : null;
    },
    filterByNutrient(nutrient) {
      this.selectedNutrient = nutrient;
      this.selectedDeficiency = null;
      this.selectedTarget = null;
    },
    filterByDeficiency(deficiency) {
      this.selectedDeficiency = deficiency;
      this.selectedNutrient = null;
      this.selectedTarget = null;
    },
    filterByTarget(target) {
      this.selectedTarget = target;
      this.selectedNutrient = null;
      this.selectedDeficiency = null;
    },
    clearFilters() {
      this.selectedNutrient = null;
      this.selectedDeficiency = null;
      this.selectedTarget = null;
    },
    setActiveTab(tab) {
      this.activeTab = tab;
      this.clearFilters();
      this.$router.push({ name: 'ProductList', query: { tab } });
    },
    async sortProducts() {
      if (this.sortType === 'latest') {
        await this.fetchLatestProducts();
      } else if (this.sortType === 'topSelling') {
        await this.fetchTopSellingProducts();
      }
    }
  },
  created() {
    this.fetchProducts();
    this.fetchNutrients();
    this.fetchDeficiencies();
    
    // 쿼리 매개변수로부터 탭을 설정
    const tab = this.$route.query.tab;
    if (tab) {
      this.activeTab = tab;
    }
    // 쿼리 매개변수로부터 정렬 유형을 설정
    const sort = this.$route.query.sort;
    if (sort) {
      this.sortType = sort;
      this.sortProducts();
    }
  }
};
</script>

<style scoped>
.album {
  padding: 2rem 0;
}

.card {
  cursor: pointer;
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.05);
}

.card-img-top {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-title {
  font-size: 1rem;
  margin-top: 10px;
}

.card-text {
  font-size: 1rem;
  font-weight: bold;
  color: #d9534f;
  margin-top: 5px;
}

.btn {
  margin-bottom: 20px;
}

.active {
  background-color: #0056b3;
  color: white;
}

.tabs {
  display: flex;
  /* justify-content: space-around; */
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
}

.tabs button {
  flex: 1;
  padding: 10px 0;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.3s;
  color: #aaa;
  min-width: 100px;
}

.tabs button.active {
  border-color: #5cb85c;
  color: #5cb85c;
}

.tab-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  width: calc(100% + 40px); /* Extend width to cover side padding */
  margin-left: -20px; /* Offset margin to align with parent container */
  margin-right: -20px; /* Offset margin to align with parent container */
}

</style>
