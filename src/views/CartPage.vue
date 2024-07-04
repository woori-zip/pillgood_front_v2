<template>
    <div class="main-container">
      <div class="box-container box-shadow">
        <div class="cart-title text-melon">장바구니</div>
        <table class="cart-table">
          <thead>
            <tr>
              <th></th>
              <th>상품 이미지</th>
              <th>상품 ID</th>
              <th>수량</th>
              <th>가격</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in cartItems" :key="item.cartNo">
              <td><input type="checkbox" v-model="item.selected" /></td>
              <td><div class="item-image"><img :src="item.productImage" alt=""></div></td>
              <td>{{ item.productId }}</td>
              <td>
                <div class="item-quantity">
                  <button @click="decreaseQuantity(item)">-</button>
                  <span>{{ item.productQuantity }}</span>
                  <button @click="increaseQuantity(item)">+</button>
                </div>
              </td>
              <td>{{ item.price * item.productQuantity }} 원</td>
            </tr>
          </tbody>
        </table>
        <div class="total-amount">총 금액: {{ totalAmount }} 원</div>
        <div class="btn-container">
          <button @click="placeOrder" class="btn btn-green">주문하기</button>
        </div>
      </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import '../assets/styles.css';

export default {
name: 'CartPage',
computed: {
    ...mapState('cart', {
    cartItems: state => state.cartItems
    }),
    totalAmount() {
    return this.cartItems.reduce((total, item) => total + item.price * item.productQuantity, 0);
    }
},
methods: {
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
    updateCartItem(item) {
    this.$store.dispatch('cart/updateCartItem', item).then(() => {
        console.log('장바구니 항목 업데이트 성공');
    }).catch(error => {
        console.error('장바구니 항목 업데이트 에러:', error);
    });
    },
    placeOrder() {
    const selectedItems = this.cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
        alert('주문할 상품을 선택하세요.');
        return;
    }
    const orderDetails = {
        items: selectedItems,
        totalAmount: this.totalAmount
    };
    this.$router.push({ name: 'Order', query: { orderDetails: JSON.stringify(orderDetails) } });
    }
},
mounted() {
    this.$store.dispatch('cart/fetchCartItems');
}
};
</script>

<style scoped>
.main-container {
  width: 100%;
  max-width: 1200px;
  margin: auto;
  padding: 20px;
  text-align: center;
}

.box-container {
  background: white;
  padding: 30px;
  width: 100%;
  text-align: center;
}

.box-shadow {
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.cart-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
}

.cart-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.cart-table th, .cart-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
}

.cart-table th {
  background-color: #f1f1f1;
}

.item-image img {
  width: 200px;
  height: 200px;
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

.btn-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.btn-container button {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
}

.btn-green {
  background-color: #C6EDC2;
  border: none;
}

.btn-green:hover {
  background-color: #4cae4c;
  color: white;
}
</style>
