<template>
  <div>
    <div style="display: flex; gap: 100px;">
      <div style="margin: auto; position: relative;">
        <div class="rating-container" >
          <star-rating v-model="averageRating" :star-size="30" :show-rating="false" :disable-click="true"></star-rating>
        </div>
        
        <div class="chart-container" style="display: inline-block;">
          <canvas id="ratingChart" style="max-width: 600px; margin: 0 auto;"></canvas>
        </div>
      </div>
    </div>

    <!-- 정렬 -->
    <div style="display: flex;">
      <label for="sortOrder">정렬:</label>
      <select id="sortOrder" v-model="sortOrder" @change="sortReviews">
        <option value="latest">최신순</option>
        <option value="oldest">오래된순</option>
        <option value="highest">별점 높은순</option>
        <option value="lowest">별점 낮은순</option>
      </select>
    </div>

    <!-- 후기 -->
    <div v-for="review in sortedReviews" :key="review.reviewId" class="box-shadow" style="padding: 20px 50px 20px 50px;">
      <!-- 작성자/작성일자 -->
      <p style="text-align: left; color: gray">
        작성자: {{ getMemberName(review.memberUniqueId) }} <br>
        작성일: {{ review.reviewDate }}
        <span v-if="isReviewOwner(review.memberUniqueId)">
          | <a href="#" @click.prevent="editReview(review.reviewId)">수정</a>
        </span>
      </p>

      <!-- 내용 -->
      <div style="text-align: left">
        <div v-html="review.reviewContent"></div>
      </div>
      <!-- 별점 -->
      <div style="margin-bottom: 20px;">
        <star-rating v-model="review.rating" :star-size="20" :show-rating="false" :disable-click="true"></star-rating>
      </div>
      <!-- 이미지 -->
      <div v-if="review.images && review.images.length > 0" style="display: flex">
        <div v-for="(image,index) in review.images" :key="image" class="align-img-container">
          <img :src="image" alt="Review Image" class="align-img" @click="openModal(index, review.images)">
        </div>
      </div>
    </div>

    <!-- 모달 -->
    <div v-if="showModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <img :src="selectedImage" alt="Selected Image" class="modal-image">
        <button class="modal-nav left" @click.stop="prevImage">&#10094;</button>
        <button class="modal-nav right" @click.stop="nextImage">&#10095;</button>
      </div>
    </div>

  </div>
</template>

<script>
import axios from 'axios';
import { mapState, mapActions } from 'vuex'; // Vuex의 헬퍼 함수 import
import StarRating from 'vue3-star-ratings'; // StarRating 컴포넌트 import
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default {
  components: {
    StarRating, // StarRating 컴포넌트 등록
  },
  props: {
    productId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      reviews: [],
      sortOrder: 'latest', // 정렬 기준을 저장
      showModal: false,
      selectedImageIndex: 0,
      imageArray: [],
      ratingCounts: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      },
      chart: null // Chart 객체를 저장할 데이터 속성
    };
  },
  computed: {
    ...mapState('member', ['members']), // Vuex 상태에서 members를 가져옴
    sortedReviews() {
      let sorted = [...this.reviews];
      switch (this.sortOrder) {
        case 'latest':
          sorted.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
          break;
        case 'oldest':
          sorted.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate));
          break;
        case 'highest':
          sorted.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          sorted.sort((a, b) => a.rating - b.rating);
          break;
      }
      return sorted;
    },
    selectedImage() {
      return this.imageArray[this.selectedImageIndex] || '';
    },
    averageRating() {
      if (this.reviews.length === 0) return 0;
      const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
      console.log('별점 합계:', sum); // 별점 합계 디버깅
      console.log('리뷰 개수:', this.reviews.length); // 리뷰 개수 디버깅
      return sum / this.reviews.length;
    }
  },
  methods: {
    ...mapActions('member', ['fetchMembers']), // member 모듈에서 fetchMembers 액션을 맵핑
    async fetchReviews() {
      try {
        console.log('Fetching reviews for product ID:', this.productId);
        const response = await axios.get('/api/reviews/list');
        console.log('All reviews:', response.data);

        // Fetch order details to get the correct productId
        const reviewsWithProductIds = await Promise.all(response.data.map(async (review) => {
          const orderDetailResponse = await axios.get(`/api/order-details/${review.orderDetailNo}`);
          const productId = orderDetailResponse.data.productId;
          const { textContent, images } = this.parseReviewContent(review.reviewContent);
          return { ...review, productId, textContent, images };
        }));

        // Filter reviews by productId
        this.reviews = reviewsWithProductIds.filter(review => review.productId === this.productId);
        
        // 리뷰를 최신순으로 정렬하여 sortedReviews에 저장
        this.sortedReviews = this.reviews.sort((a, b) => new Date(b.reviewDate) - new Date(a.reviewDate));
        
        // 별점 카운트 초기화
        this.ratingCounts = {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        };
        
        // 별점 카운트 업데이트
        this.reviews.forEach(review => {
          if (this.ratingCounts[review.rating] !== undefined) {
            this.ratingCounts[review.rating]++;
          }
        });
        
        // 별점 그래프 렌더링
        this.renderBarChart();

        console.log('Filtered reviews:', this.reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    },
    parseReviewContent(content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const pTags = doc.querySelectorAll('p');
      const imgTags = doc.querySelectorAll('img');
      
      const textContent = Array.from(pTags).map(p => p.textContent).join(' ');
      const images = Array.from(imgTags).map(img => img.src);

      return { textContent, images };
    },
    getMemberName(memberId) {
      const member = this.members.find(member => member.memberUniqueId === memberId);
      return member ? member.name : '알 수 없음';
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString();
    },
    openModal(index, images) {
      this.selectedImageIndex = index;
      this.imageArray = images;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.selectedImageIndex = 0;
      this.imageArray = [];
    },
    prevImage() {
      if (this.selectedImageIndex > 0) {
        this.selectedImageIndex -= 1;
      } else {
        this.selectedImageIndex = this.imageArray.length - 1;
      }
    },
    nextImage() {
      if (this.selectedImageIndex < this.imageArray.length - 1) {
        this.selectedImageIndex += 1;
      } else {
        this.selectedImageIndex = 0;
      }
    },
    sortReviews() {
      // 이 함수는 선택된 정렬 기준에 따라 리뷰를 정렬합니다.
      console.log('Selected sort order:', this.sortOrder);
    },
    renderBarChart() {
      const ctx = document.getElementById('ratingChart').getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1점', '2점', '3점', '4점', '5점'],
          datasets: [{
            label: '별점',
            data: [
              this.ratingCounts[1],
              this.ratingCounts[2],
              this.ratingCounts[3],
              this.ratingCounts[4],
              this.ratingCounts[5]
            ],
            backgroundColor: [
              '#B4D9A9',
              '#B4D9A9',
              '#B4D9A9',
              '#B4D9A9',
              '#B4D9A9'
            ],
            borderWidth: 1
          }]
        },
        options: {
          indexAxis: 'y',
          scales: {
            x: {
              grid: {
                display: false // x축 그리드 라인 제거
              },
              ticks: {
                display: false // x축 레이블(0, 1, 2, 3, ...) 제거
              }
            },
            y: {
              grid: {
                display: false // y축 그리드 라인 제거
              },
              ticks: {
                beginAtZero: true // y축 눈금을 0부터 시작
              }
            }
          },
          plugins: {
            legend: {
              display: false // 범례 숨김
            },
            tooltip: {
              backgroundColor: 'rgba(0,0,0,0.7)', // 툴팁 배경색 변경
              titleFont: { size: 16 }, // 툴팁 제목 폰트 크기 변경
              bodyFont: { size: 14 }, // 툴팁 본문 폰트 크기 변경
              callbacks: {
                title: function() {
                  return ''; // 툴팁 제목을 비워둠
                },
                label: function (context) {
                  // const index = context.dataIndex; // 현재 데이터의 인덱스
                  const value = context.raw; // 데이터 값
                  return `${value}개`; // 툴팁에 표시할 내용
                }
              }
            }
          }
        }
      });
    },
    isReviewOwner(memberUniqueId) {
      console.log('로그인 된 사용자 아이디:', memberUniqueId)
      return memberUniqueId === this.memberId;
    },
    editReview(reviewId) {
      this.$router.push({ name: 'reviewedit', params: { reviewId } });
    }
  },
  watch: {
    productId: 'fetchReviews'
  },
  async created() {
    await this.fetchMembers();
    this.fetchReviews();
  }
};
</script>

<style scoped>
.review {
  background-color: #ffffff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #eee;
}

.rating {
  font-weight: bold;
  color: #343a40;
}

.align-img-container{
  position: relative;
  width: 100px;
  height: 100px;
}

.align-img{
  display: inline-block;
  position: absolute;
  top: 0; 
  left: 0;
  transform: translate(50,50);
  width: 100%;
  height: 100%;
  object-fit: cover;
  margin: auto;
}
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.8);
}

.modal-content {
  position: relative;
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 700px;
}

.close {
  position: absolute;
  top: 10px;
  right: 25px;
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.modal-image {
  width: 100%;
  height: auto;
}
.modal-nav {
  position: absolute;
  top: 50%;
  width: auto;
  padding: 16px;
  margin-top: -22px;
  color: white;
  font-weight: bold;
  font-size: 18px;
  transition: 0.3s;
  cursor: pointer;
  user-select: none;
}

.modal-nav:hover {
  background-color: rgba(0,0,0,0.8);
}

.left {
  left: 0;
}

.right {
  right: 0;
}

.rating-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}
</style>
