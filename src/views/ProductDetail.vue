<template>
    <div class="main-container">
        <div class="breadcrumb">
            <p>카테고리 > [브랜드명] {{ product.productName }}</p>
        </div>
        <div class="product-main">
            <div class="product-image">
                <img src="../assets/product_01.png" alt="Product Image" />
            </div>
            <div class="product-info">
                <h1 class="product-title">{{ product.productName }}</h1>
                <p class="product-price">{{ product.price }}원</p>
                <p>{{ product.description }}</p>
                <div class="quantity-selector">
                    <button @click="decreaseQuantity">-</button>
                    <span>{{ quantity }}</span>
                    <button @click="increaseQuantity">+</button>
                </div>
                <div class="button-group">
                    <button @click="addToCart" class="btn btn-cart">장바구니 담기</button>
                    <button @click="buyNow" class="btn btn-buy">바로 구매</button>
                </div>
            </div>
        </div>
        <div class="tabs">
            <button @click="activeTab = 'description'" :class="{ active: activeTab === 'description' }">상품설명</button>
            <button @click="activeTab = 'details'" :class="{ active: activeTab === 'details' }">상세정보</button>
            <button @click="activeTab = 'reviews'" :class="{ active: activeTab === 'reviews' }">후기 ({{ product.reviews }})</button>
            <button @click="activeTab = 'inquiries'" :class="{ active: activeTab === 'inquiries' }">문의</button>
        </div>
        <div class="tab-content">
            <div v-if="activeTab === 'description'">
                <p>{{ product.fullDescription }}</p>
            </div>
            <div v-if="activeTab === 'details'">
                <p>{{ product.details }}</p>
            </div>
            <div v-if="activeTab === 'reviews'">
                <ul>
                    <li v-for="review in product.reviews" :key="review.id" class="review">
                        <p>{{ review.content }}</p>
                        <p class="rating">Rating: {{ review.rating }}</p>
                    </li>
                </ul>
            </div>
            <div v-if="activeTab === 'inquiries'">
                <ul>
                    <li v-for="inquiry in product.inquiries" :key="inquiry.id" class="inquiry">
                        <p>{{ inquiry.content }}</p>
                        <p class="answered">Answered: {{ inquiry.answered ? 'Yes' : 'No' }}</p>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import '../assets/styles.css';

export default {
    props: ['id'],
    data() {
        return {
            activeTab: 'description',
            product: {
                productName: '',
                price: 0,
                productImage: '',
                description: '',
                fullDescription: '',
                details: '',
                reviews: [],
                inquiries: []
            },
            quantity: 1 // 초기 수량 설정
        };
    },
    methods: {
        async fetchProductDetails() {
            try {
                const response = await axios.get(`http://localhost:9095/products/detail/${this.id}`);
                this.product = response.data;
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
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
                    productId: this.id,
                    productQuantity: this.quantity // 선택한 수량을 보냄
                };
                const response = await axios.post('http://localhost:9095/carts/create', cartItem, { withCredentials: true });
                if (response.status === 201) {
                    console.log('장바구니에 추가되었습니다.');
                    this.$router.push({ name: 'Cart' });
                } else {
                    console.error('장바구니 추가 실패:', response);
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        },
        buyNow() {
            const orderDetails = {
                items: [{ productId: this.product.productId, productQuantity: this.quantity, price: this.product.price }],
                totalAmount: this.product.price * this.quantity
            };
            this.$router.push({ name: 'Order', query: { orderDetails: JSON.stringify(orderDetails) } });
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
    margin-bottom: 20px;
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

.btn {
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
}

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
