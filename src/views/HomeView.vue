<template>
  <div id="myCarousel" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#myCarousel" :data-bs-slide-to="index" :class="{ active: index === 0 }" aria-current="true" :aria-label="'Slide ' + (index + 1)" v-for="(slide, index) in slides" :key="index"></button>
    </div>
    <div class="carousel-inner">
      <div class="carousel-item" :class="{ active: index === 0 }" v-for="(slide, index) in slides" :key="index">
        <img :src="slide.image" class="d-block w-100 custom-banner" alt="Slide image">
        <div class="container">
          <div class="carousel-caption" :class="slide.captionClass">
            <div class="headline-container">
              <h1 style="margin-bottom: 20px">{{ slide.headline }}</h1>
                <div v-if="slide.route" class="btn-container" style="margin-top: 20px; margin-bottom: 20px;">
                  <router-link class="btn btn-green" :to="slide.route">{{ slide.buttonText }}</router-link>
                  <hr>
                </div>
              <a href="/productlist"><p>{{ slide.content }}</p></a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button id="carousel-control-prev" class="carousel-control-prev" type="button" data-bs-target="#myCarousel" data-bs-slide="prev">
      <span id="carousel-control-prev-icon" class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    </button>
    <button id="carousel-control-next" class="carousel-control-next" type="button" data-bs-target="#myCarousel" data-bs-slide="next">
      <span id="carousel-control-next-icon" class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    </button>
  </div>

  <main>
    <div class="album py-5 bg-body-tertiary">
      <div class="container">
        <h4 style="margin-bottom: 30px;">🔥Best!</h4>
        <div id="topSellingCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item" :class="{ active: index === 0 }" v-for="(chunk, index) in chunkedTopSellingProducts" :key="index">
              <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
                <div v-for="product in chunk" :key="product.productId || index" class="col">
                  <div class="card h-100" :class="{ 'dummy-card': product.isDummy }">
                    <img v-if="!product.isDummy" @click="viewProduct(product.productId)" :src="product.productImage" class="card-img-top" alt="Product Image">
                    <div class="card-body">
                      <h6 class="card-title">{{ product.isDummy ? 'Placeholder' : product.productName }}</h6>
                      <p class="card-text">{{ product.isDummy ? '' : formatPrice(product.price) + ' 원' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button id="carousel-control-prev2" class="carousel-control-prev" type="button" data-bs-target="#topSellingCarousel" data-bs-slide="prev">
            <span id="carousel-control-prev-icon" class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button id="carousel-control-next2" class="carousel-control-next" type="button" data-bs-target="#topSellingCarousel" data-bs-slide="next">
            <span id="carousel-control-next-icon" class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>          
        </div>
        <hr style="color: #94B58B; margin-bottom: 50px;">
        <h4 style="margin-bottom: 30px;">🔥New!</h4>
        <div id="latestCarousel" class="carousel slide" data-bs-ride="carousel" style="display: flex; align-item: center">
          <div class="carousel-inner">
            <div class="carousel-item" :class="{ active: index === 0 }" v-for="(chunk, index) in chunkedLatestProducts" :key="index">
              <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
                <div v-for="product in chunk" :key="product.productId || index" class="col">
                  <div class="card h-100" :class="{ 'dummy-card': product.isDummy }">
                    <img v-if="!product.isDummy" @click="viewProduct(product.productId)" :src="product.productImage" class="card-img-top" alt="Product Image">
                    <div class="card-body">
                      <h6 class="card-title">{{ product.isDummy ? 'Placeholder' : product.productName }}</h6>
                      <p class="card-text">{{ product.isDummy ? '' : formatPrice(product.price) + ' 원' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button id="carousel-control-prev2" class="carousel-control-prev" type="button" data-bs-target="#latestCarousel" data-bs-slide="prev">
            <span id="carousel-control-prev-icon" class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button id="carousel-control-next2" class="carousel-control-next" type="button" data-bs-target="#latestCarousel" data-bs-slide="next">
            <span id="carousel-control-next-icon" class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import '../assets/main.css';
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      slides: [
        {
          image: 'https://i.imgur.com/RgYDqGf.gif',
          headline: '지금 나에게 필요한',
          content: '모든 상품 보러 가기',
          buttonText: '건강 분석 바로 가기',
          route: '/survey', // 라우터 경로 설정
          captionClass: 'text-start'
        },
        {
          image: 'https://i.imgur.com/DSNhSvE.gif',
          headline: '멀리 갈 필요 없이'
        },
        {
          image: 'https://imgur.com/k1xAPI2.gif',
          headline: '고민할 필요 없이'
        }
      ]
    }
  },
  computed: {
    ...mapGetters('home', ['topSellingProducts', 'latestProducts']),
    chunkedTopSellingProducts() {
      console.log('Top selling products before chunking:', this.topSellingProducts);
      return this.chunkArray(this.topSellingProducts.filter(product => product.active), 6);
    },
    chunkedLatestProducts() {
      console.log('Latest products before chunking:', this.latestProducts);
      return this.chunkArray(this.latestProducts.filter(product => product.active), 6);
    }
  },
  methods: {
    ...mapActions('home', ['fetchTopSellingProducts', 'fetchLatestProducts']),
    viewProduct(productId) {
      this.$router.push({ name: 'ProductDetail', params: { id: productId } });
    },
    formatPrice(value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    chunkArray(array, size) {
      const chunkedArr = [];
      for (let i = 0; i < array.length; i += size) {
        chunkedArr.push(array.slice(i, i + size));
      }
      return chunkedArr.map(chunk => {
        while (chunk.length < size) {
          chunk.push({ isDummy: true });
        }
        return chunk;
      });
    }
  },
  created() {
    this.fetchTopSellingProducts();
    this.fetchLatestProducts();
  }
}
</script>

<style scoped>
.headline-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.headline-container h1 {
  color: white;
  font-weight: bold;

}

.headline-container a {
  text-decoration: none;
  color: white;
}
.btn-container {
  box-shadow: 8px 8px 82px -46px rgba(66, 68, 90, 1);
}

.btn-green {
  background-color: #4cae4c;
}

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

.carousel-item {
  min-height: 300px; /* Adjust the height as needed */
}

.dummy-card {
  background-color: #f8f9fa; /* Light grey background for dummy cards */
  border: 1px dashed #ddd; /* Dashed border for visual distinction */
}

/* 기존 스타일 정의 부분 */
#carousel-control-prev2,
#carousel-control-next2 {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  border: none;
  width: 100px;
  padding: 10px;
  border-radius: 20%;
  background: #babcbd;
  opacity: 10%;
  box-shadow: 7px 7px 52px -9px rgba(198, 198, 198, 1);
}

#carousel-control-prev2 {
  left: -110px;
}

#carousel-control-next2 {
  right: -110px; 
}

</style>
