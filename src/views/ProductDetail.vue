<template>
  <div class="main-container">
    <div class="breadcrumb">
      <p>카테고리 > [브랜드명] {{ product.productName }}</p>
    </div>
    <div class="product-main">
      <div class="product-image">
        <img :src="product.productImage || '../assets/product_01.png'" alt="Product Image" />
      </div>
      <div class="product-info" style="justify-content: space-around;">
        <div>
          <h1 class="product-title">{{ product.productName }}</h1>
          <p class="product-price">{{ product.price }}원</p>
          <p>{{ product.description }}</p>

          <div class="quantity-selector">
            <button @click="decreaseQuantity">-</button>
            <span>{{ quantity }}</span>
            <button @click="increaseQuantity">+</button>
          </div>

          <!-- 버튼 -->
          <div class="btn-container" style="justify-content: end;">
            <button @click="addToCart" class="btn btn-gray">장바구니 담기</button>
            <button @click="buyNow" class="btn btn-green">바로 구매</button>
          </div>
        </div>
        
      </div>
    </div>
    <div class="tabs">
      <button @click="activeTab = 'description'" :class="{ active: activeTab === 'description' }">상품설명</button>
      <button @click="activeTab = 'details'" :class="{ active: activeTab === 'details' }">상세정보</button>
      <button @click="activeTab = 'reviews'" :class="{ active: activeTab === 'reviews' }">후기</button>
    </div>
    <!-- 탭 내용 -->
    <div class="tab-content">

      <div v-if="activeTab === 'description'">
        <p>{{ product.fullDescription }}</p>
      </div>

      <div v-if="activeTab === 'details'">
        <p>{{ product.details }}</p>
      </div>

      <div v-if="activeTab === 'reviews'">
        <ReviewView :productId="product.productId" /> 
      </div>

    </div>
    <!-- 탭 끝 -->
  </div>
</template>

<script>
import axios from 'axios';
import ReviewView from '../components/ReviewView.vue'; // ReviewView 컴포넌트 불러오기

export default {
  components: {
    ReviewView // 컴포넌트 등록
  },
  props: ['id'],
  data() {
    return {
      activeTab: 'description',
      product: {
        productId: 0,
        productName: '',
        price: 0,
        productImage: '',
        description: '',
        fullDescription: '',
        details: '',
      },
      quantity: 1 // 초기 수량 설정
    };
  },
  methods: {
    async fetchProductDetails() {
      try {
        const response = await axios.get(`/api/products/detail/${this.id}`);
        this.product = response.data;
        this.product.productImage = this.extractFirstImage(response.data.productImage);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    },
    extractFirstImage(htmlString) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const imgTag = doc.querySelector('img');
      return imgTag ? imgTag.src : null;
    },
    decreaseQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    increaseQuantity() {
      this.quantity++;
    },
    async addToCart() {
      try {
        const cartItem = {
          productId: this.product.productId, // 여기에서 this.product.productId를 사용합니다.
          productQuantity: this.quantity // 선택한 수량을 보냄
        };
        const response = await axios.post('/api/carts/create', cartItem, { withCredentials: true });
        if (response.status === 201) {
          this.$router.push({ name: 'Cart' });
        } else {
          console.error('장바구니 추가 실패:', response);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    },
    async buyNow() {
      const orderItem = {
        productId: this.product.productId, // 여기에서 this.product.productId를 사용합니다.
        productName: this.product.productName,
        productQuantity: this.quantity,
        price: this.product.price
      };

      try {
        await axios.post('/api/orders/prepare', [orderItem], { withCredentials: true });
        this.$router.push({ name: 'Order' });
      } catch (error) {
        console.error('Error preparing order:', error);
      }
    }
  },
  created() {
    this.fetchProductDetails();
  }
};
</script>

<style scoped>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.breadcrumb {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}

.product-main {
  display: flex;
  gap: 40px;
}

.product-image {
  flex: 1;
  background-color: #f8f9fa;
  text-align: center;
  padding: 40px;
  border-radius: 8px;
}

.product-image img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 10px;
}

.product-price {
  font-size: 1.2rem;
  color: #d9534f;
  margin-bottom: 20px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: auto;
  width: 150px;
}

.quantity-selector button {
  width: 30px;
  height: 30px;
  background-color: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 10px;
}

/* .btn {
  width: 120px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cart {
  background-color: #5cb85c;
  color: white;
}

.btn-buy {
  background-color: #5cb85c;
  color: white;
} */

.tabs {
  display: flex;
  justify-content: space-around;
  margin-top: 40px;
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

.review, .inquiry {
  background-color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.rating, .answered {
  font-weight: bold;
  color: #343a40;
}
</style>
