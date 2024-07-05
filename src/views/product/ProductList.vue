<template>
  <div class="main-container box-shadow">
    <h1 class="text-melon">제품 목록</h1>
    <div style="display: flex; align-items: center">
      <select style="width:150px;" v-model="selectedFilter">
        <option value="">- 선택 -</option>
        <option value="productName">제품명</option>
        <option value="nutrient">성분</option>
        <option value="target">대상</option>
      </select>
      <input v-model="searchQuery" :disabled="!selectedFilter" placeholder="검색어를 입력하세요">
      <button class="small-btn" @click="resetFilters">초기화</button>
      <router-link class="small-btn" to="/productcreate">+제품 등록</router-link>
      <router-link class="small-btn btn-green" to="/nutrientedit">성분 관리</router-link>
    </div>
    <table class="line-table">
      <thead>
        <tr>
          <th>제품명</th>
          <th>성분</th>
          <th>가격</th>
          <th>재고</th>
          <th>대상</th>
          <th>상태</th>
          <th v-if="isAdmin">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="product in filteredProducts" 
          :key="product.productId"
          @mouseover="showImage(product.productId, $event)"
          @mouseleave="hideImage"
          @mousemove="moveImage($event)"
        >
          <td>{{ product.productName }}</td>
          <td>{{ getNutrientName(product.nutrientId) }}</td>
          <td>{{ product.price }}</td>
          <td>{{ product.stock }}</td>
          <td>{{ product.target }}</td>
          <td>{{ product.active ? '활성' : '비활성' }}</td>
          <td v-if="isAdmin">
            <select v-model="product.active" style="width:150px;">
              <option :value="true">활성</option>
              <option :value="false">비활성</option>
            </select>
            <button class="small-btn" @click="confirmUpdateStatus(product)">확인</button>
            <button class="small-btn" @click="editProduct(product)">수정</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="hoveredImage" :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }" class="image-tooltip">
      <img :src="hoveredImage" alt="Product Image" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  name: 'ProductList',
  data() {
    return {
      selectedFilter: '',
      searchQuery: '',
      hoveredImage: null,
      tooltipPosition: { x: 10, y: 0 }
    };
  },
  computed: {
    ...mapGetters('product', ['products']),
    ...mapGetters('nutrient', ['nutrients']),
    ...mapState('member', ['isAdmin']),
    // 제품 검색
    filteredProducts() {
      // selectedFilter와 searchQuery가 둘 다 없으면 전체 제품 목록 반환
      if (!this.selectedFilter && !this.searchQuery) {
        return this.products;
      }

      const query = this.searchQuery.toLowerCase();

      return this.products.filter(product => {
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
  },
  async created() {
    await this.checkLoginStatus(); // 로그인 상태를 먼저 확인하여 Vuex 상태를 업데이트
    // console.log('isAdmin after checkLoginStatus:', this.isAdmin);
    
    await this.fetchProducts(); // 관리자 여부와 관계없이 제품 목록을 로드
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
    editProduct(product) {
      console.log('Edit product:', product);
      this.$router.push({ name: 'ProductEdit', params: { id: product.productId } });
    },
    async confirmUpdateStatus(product) {
      console.log('확인 버튼 클릭 - 업데이트할 제품:', product);
      try {
        const response = await this.updateProductStatus({ productId: product.productId, active: product.active });
        console.log('상태 변경할 제품:', product);
        console.log('서버 응답:', response); // 서버 응답 로그 추가
        if (response && response.status === 200) {
          console.log('제품 상태 업데이트 완료:', product);
          alert('제품 상태가 업데이트되었습니다.');
        } else {
          console.error('제품 상태 업데이트 실패:', response);
          alert('제품 상태 업데이트에 실패했습니다.');
        }
      } catch (error) {
        console.error('상태 변경 실패:', error);
        alert('상태 변경에 실패했습니다.');
      }
    },
    resetFilters() {
      this.selectedFilter = '';
      this.searchQuery = '';
    },
    // 제품 이미지 보이기
    async showImage(productId, event) {
      try {
        // console.log(`Fetching details for product ID: ${productId}`);
        const productDetails = await this.fetchProductDetails(productId);
        console.log('Product Details:', productDetails);

        if (!productDetails || !productDetails.productImage) {
          throw new Error('No product description found');
        }

        const firstImage = this.extractFirstImage(productDetails.productImage);
        console.log('First Image:', firstImage);

        if (!firstImage) {
          throw new Error('No image found in the product image field');
        }

        this.hoveredImage = firstImage;
        this.tooltipPosition = { x: event.pageX + 15, y: event.pageY + 15 }; // 초기 위치 설정
      } catch (error) {
        console.error('이미지를 불러오는 데 실패했습니다:', error.message);
      }
    },
    hideImage() {
      this.hoveredImage = null;
    },
    moveImage(event) {
      this.tooltipPosition = { x: event.pageX + 15 , y: event.pageY + 15 };
    },
    extractFirstImage(htmlString) { //매개변수 : html 형식의
      console.log('Extracting image from HTML string:', htmlString);
      // 1. 문자열로 된 html/xml을 DOM 구조로 파싱
      const parser = new DOMParser(); // DOMParser 객체 생성
      // html 문자열을 파싱하여 DOM document 객체로 변환
      // 두 번째 매개변수로 text/html 사용 -> html로 파싱
      const doc = parser.parseFromString(htmlString, 'text/html'); 

      // 2. 이미지 태그 추출
      const imgTag = doc.querySelector('img'); // img 태그가 없으면 null 반환
      console.log('Parsed HTML:', doc);
      console.log('Image Tag:', imgTag);
      return imgTag ? imgTag.src : null;
    }
  }
};
</script>


<style>
.line-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}

.line-table thead {
  background-color: #EBF7F0;
}

.line-table th, td {
  padding: 2px 2px 2px 2px;
  border-bottom: 1px solid gray;
  align-items: center; /* 세로 중앙 정렬 */
}

.line-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.small-btn {
  display: inline-block;
  white-space: nowrap;
  height: 100%;
  border: 0;
  background: #D5D9C4;
  border-radius: 5px;
  margin-right: 5px;
  text-decoration-line: none;
  color: black;
  padding: 2px;
}

.small-btn:hover {
  color:black;
  background: #C6EDC2;
}

.image-tooltip {
  position: absolute;
  background-color: white;
  border: 1px solid #ddd;
  padding: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.image-tooltip img {
  width: 150px; /* 너비를 150px로 고정 */
  height: auto; /* 높이는 자동으로 설정하여 비율 유지 */
}
</style>
