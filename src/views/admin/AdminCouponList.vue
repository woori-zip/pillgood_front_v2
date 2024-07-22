<template>
  <v-container class="main-container">
    <v-card>
      <v-card-title>
        <h1 class="text-melon">쿠폰 목록</h1>
      </v-card-title>

      <v-card-subtitle>
        <v-row align="center">
          <v-col cols="12" sm="2">
            <v-select v-model="searchStatus" :items="displayStatusOptions" item-text="title" item-value="value" label="상태 선택" dense></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="searchQuery" label="검색어 입력" dense></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn color="primary" @click="resetFilters">초기화</v-btn>&nbsp;
            <v-btn color="primary" @click="openCreateDialog">쿠폰 등록</v-btn>
          </v-col>
        </v-row>
      </v-card-subtitle>

      <v-data-table :headers="headers" :items="filteredCoupons" class="elevation-1" item-value="couponId">
        <template v-slot:[`item.couponId`]="{ item }">
          <span>{{ item.couponId }}</span>
        </template>
        <template v-slot:[`item.couponName`]="{ item }">
          <span>{{ item.couponName }}</span>
        </template>
        <template v-slot:[`item.discountAmount`]="{ item }">
          <span>{{ item.discountAmount }}</span>
        </template>
        <template v-slot:[`item.couponStatus`]="{ item }">
          <span>{{ getCouponStatus(item.couponStatus) }}</span>
        </template>
        <template v-slot:[`item.validityPeriod`]="{ item }">
          <span>{{ item.validityPeriod }}일</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn color="info" small @click="openEditDialog(item)">수정</v-btn>
          <v-btn color="error" small @click="confirmDelete(item.couponId)">삭제</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="editDialog" max-width="800px">
      <AdminCouponEdit :coupon="selectedCoupon" @save="onCouponSave" @cancel="editDialog = false" />
    </v-dialog>

    <v-dialog v-model="createDialog" max-width="800px">
      <AdminCouponCreate @save="onCouponSave" @cancel="createDialog = false" />
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import AdminCouponEdit from './AdminCouponEdit.vue';
import AdminCouponCreate from './AdminCouponCreate.vue';

export default {
  name: 'AdminCouponList',
  components: { AdminCouponEdit, AdminCouponCreate },
  data() {
    return {
      searchQuery: '',
      searchStatus: '',
      editDialog: false,
      createDialog: false,
      selectedCoupon: null,
      headers: [
        { title: '쿠폰 ID', value: 'couponId', align: 'center' },
        { title: '쿠폰 이름', value: 'couponName', align: 'center' },
        { title: '할인 금액', value: 'discountAmount', align: 'center' },
        { title: '상태', value: 'couponStatus', align: 'center' },
        { title: '유효 기간', value: 'validityPeriod', align: 'center' },
        { title: '수정/삭제', value: 'actions', align: 'center', sortable: false },
      ],
      displayStatusOptions: [
        { title: '활성', value: 'T' },
        { title: '비활성', value: 'F' },
      ],
    };
  },
  computed: {
    ...mapGetters('coupon', ['allCoupons']),
    filteredCoupons() {
      return this.allCoupons.filter(coupon => {
        const matchesQuery = this.searchQuery
          ? coupon.couponName.toLowerCase().includes(this.searchQuery.toLowerCase())
          : true;
        const matchesStatus = this.searchStatus ? coupon.couponStatus === this.searchStatus : true;
        return matchesQuery && matchesStatus;
      });
    },
  },
  methods: {
    ...mapActions('coupon', ['fetchCoupons', 'deleteCoupon']),
    getCouponStatus(status) {
      const statusOption = this.displayStatusOptions.find(option => option.value === status);
      return statusOption ? statusOption.title : status;
    },
    openEditDialog(coupon) {
      this.selectedCoupon = coupon;
      this.editDialog = true;
    },
    openCreateDialog() {
      this.createDialog = true;
    },
    async confirmDelete(couponId) {
      if (confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
        try {
          await this.deleteCoupon(couponId);
          alert('쿠폰이 삭제되었습니다.');
        } catch (error) {
          console.error('쿠폰 삭제 실패:', error);
          alert('쿠폰 삭제에 실패했습니다.');
        }
      }
    },
    onCouponSave() {
      this.editDialog = false;
      this.createDialog = false;
      this.fetchCoupons();
    },
    resetFilters() {
      this.searchQuery = '';
      this.searchStatus = '';
    },
  },
  created() {
    this.fetchCoupons();
  },
};
</script>

<style scoped>
.main-container {
  padding: 20px;
}

.text-melon {
  color: #ff6f61;
}
</style>
