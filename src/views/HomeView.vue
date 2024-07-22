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
            <h1>{{ slide.headline }}</h1>
            <p>{{ slide.content }}</p>
            <p v-if="index === 0" class="button-container">
              <router-link class="btn btn-lg btn-primary" :to="slide.route">{{ slide.buttonText }}</router-link>
            </p>
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
                      <p class="card-text">{{ product.isDummy ? '' : product.price + '원' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#topSellingCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#topSellingCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
        <hr style="color: #94B58B; margin-bottom: 50px;">
        <h4 style="margin-bottom: 30px;">🔥New!</h4>
        <div id="latestCarousel" class="carousel slide" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div class="carousel-item" :class="{ active: index === 0 }" v-for="(chunk, index) in chunkedLatestProducts" :key="index">
              <div class="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3">
                <div v-for="product in chunk" :key="product.productId || index" class="col">
                  <div class="card h-100" :class="{ 'dummy-card': product.isDummy }">
                    <img v-if="!product.isDummy" @click="viewProduct(product.productId)" :src="product.productImage" class="card-img-top" alt="Product Image">
                    <div class="card-body">
                      <h6 class="card-title">{{ product.isDummy ? 'Placeholder' : product.productName }}</h6>
                      <p class="card-text">{{ product.isDummy ? '' : product.price + '원' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-control-prev" type="button" data-bs-target="#latestCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#latestCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
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
          image: require('@/assets/banner1.png'),
          headline: 'Example headline.',
          content: 'Some representative placeholder content for the first slide of the carousel.',
          buttonText: '설문 조사 바로 가기',
          route: '/survey', // 라우터 경로 설정
          captionClass: 'text-start'
        },
        {
          image: require('@/assets/banner2.jpg'),
          headline: 'Another example headline.',
          content: 'Some representative placeholder content for the second slide of the carousel.',
          buttonText: 'Learn more',
          link: '#',
          captionClass: ''
        },
        {
          image: require('@/assets/banner3.jpg'),
          headline: 'One more for good measure.',
          content: 'Some representative placeholder content for the third slide of this carousel.',
          buttonText: 'Browse gallery',
          link: '#',
          captionClass: 'text-end'
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
</style>
