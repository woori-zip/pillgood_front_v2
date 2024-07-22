<template>
  <div class="main-container">
    <h2 class="text-melon">장바구니</h2>
      <div class="box-container box-shadow">
        <div class="bttn-container" style="width: 300px;">
          <button @click="selectAllItems" class="btn btn-green">전체 선택</button>
          <button @click="deselectAllItems" class="btn btn-gray">전체 선택 해제</button>
        </div>
        <hr class="line">
          <table class="line-table" v-if="localCartItems.length > 0">

            <thead>
              <tr>
                <th></th>
                  <th colspan="2">상품</th>
                  <th>수량</th>
                  <th>가격</th>
                  <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in localCartItems" :key="item.cartNo">
                <td><input type="checkbox" v-model="item.selected" /></td>
                <td ><div class="item-image"><img :src="item.productImage || '../assets/product_01.png'" alt=""></div></td>
                <td><strong>{{ item.productName }}</strong></td>
                <td>
                  <div class="item-quantity">
                    <button @click="decreaseQuantity(item)">-</button>
                    <span>{{ item.productQuantity }}</span>
                    <button @click="increaseQuantity(item)">+</button>
                    </div>
                </td>
                <td>{{ item.price * item.productQuantity }} 원</td>
                <td>
                  <button @click="deleteCartItem(item)" class="btn btn-gray">삭제</button>
                  </td>
              </tr>
            </tbody>
          </table>
          <div v-else>
              장바구니에 상품이 없습니다.
          </div>
          <hr class="line">
          <div class="total-amount" v-if="localCartItems.length > 0">선택한 상품 총 금액: {{ totalAmount }} 원</div>
          <div class="btn-container" v-if="localCartItems.length > 0">
              <button @click="placeOrder" class="btn btn-green">주문하기</button>
          </div>
      </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';
import '../assets/styles.css';

export default {
  name: 'CartPage',
  data() {
    return {
      localCartItems: [] // 로컬 상태로 관리할 장바구니 항목
    };
  },
  computed: {
    ...mapState('cart', {
      cartItems: state => state.cartItems
    }),
    totalAmount() {
      return this.localCartItems
        .filter(item => item.selected)
        .reduce((total, item) => total + item.price * item.productQuantity, 0);
    }
  },
  watch: {
    cartItems: {
      immediate: true,
      handler(newItems) {
        // Vuex 상태가 변경될 때 로컬 상태를 업데이트
        this.localCartItems = newItems.map(item => ({
          ...item,
          selected: true // 모든 아이템을 기본적으로 선택 상태로 설정
        }));

        // 각 제품의 이미지를 가져오는 작업 수행
        this.localCartItems.forEach(item => {
          this.fetchProductImage(item);
        });
      }
    }
  },
  methods: {
    async fetchProductImage(item) {
      try {
        const response = await axios.get(`/api/products/detail/${item.productId}`);
        item.productImage = this.extractFirstImage(response.data.productImage);
      } catch (error) {
        console.error(`Error fetching image for product ID ${item.productId}:`, error);
        item.productImage = null; // 기본 이미지로 설정
      }
    },
    extractFirstImage(htmlString) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      const imgTag = doc.querySelector('img');
      return imgTag ? imgTag.src : null;
    },
    decreaseQuantity(item) {
      if (item.productQuantity > 1) {
        item.productQuantity--;
        this.updateCartItem(item);
      }
    },
    increaseQuantity(item) {
      item.productQuantity++;
      this.updateCartItem(item);
    },
    async updateCartItem(item) {
      try {
        await this.$store.dispatch('cart/updateCartItem', item);
        // 선택 상태 유지
        const updatedItem = this.localCartItems.find(localItem => localItem.cartNo === item.cartNo);
        if (updatedItem) {
          updatedItem.selected = item.selected;
        }
      } catch (error) {
        console.error('장바구니 항목 업데이트 에러:', error);
      }
    },
    async deleteCartItem(item) {
      try {
        await this.$store.dispatch('cart/deleteCartItem', item.cartNo);
        this.localCartItems = this.localCartItems.filter(localItem => localItem.cartNo !== item.cartNo);
      } catch (error) {
        console.error('장바구니 항목 삭제 에러:', error);
      }
    },
    selectAllItems() {
      this.localCartItems.forEach(item => {
        item.selected = true;
      });
    },
    deselectAllItems() {
      this.localCartItems.forEach(item => {
        item.selected = false;
      });
    },
    async placeOrder() {
      const selectedItems = this.localCartItems.filter(item => item.selected);
      if (selectedItems.length === 0) {
        alert('주문할 상품을 선택하세요.');
        return;
      }
      try {
        await axios.post('/api/orders/prepare', selectedItems, { withCredentials: true });
        this.$router.push({ name: 'Order' });
      } catch (error) {
        console.error('Error preparing order:', error);
      }
    }
  },
  mounted() {
    this.$store.dispatch('cart/fetchCartItems');
  }
};
</script>

<style scoped>
.bttn-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.delete-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.item-image {
  width: 200px;
  height: 200px;
  margin-bottom: 10px;
  border-radius: 15px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.item-quantity button {
  width: 30px;
  height: 30px;
  background-color: #ddd;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.total-amount {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 20px;
  font-size: 1.5rem;
  font-weight: bold;
  background-color: #f1f1f1;
  border-radius: 8px;
  margin-top: 20px;
}
</style>
