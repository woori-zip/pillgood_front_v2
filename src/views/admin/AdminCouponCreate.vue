<template>
  <v-card>
    <v-card-title>
      <h2>쿠폰 등록</h2>
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid">
        <v-text-field v-model="coupon.couponName" label="쿠폰 이름" required></v-text-field>
        <v-text-field v-model="coupon.discountAmount" label="할인 금액" type="number" required></v-text-field>
        <v-text-field v-model="coupon.discountDescription" label="할인 설명"></v-text-field>
        <v-select v-model="coupon.couponStatus" :items="displayStatusOptions" item-text="text" item-value="value" label="상태" required></v-select>
        <v-text-field v-model="coupon.validityPeriod" label="유효 기간 (일)" type="number" required></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="saveCoupon">저장</v-btn>
      <v-btn color="grey" @click="$emit('cancel')">취소</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'AdminCouponCreate',
  data() {
    return {
      valid: false,
      coupon: {
        couponName: '',
        discountAmount: 0,
        discountDescription: '',
        couponStatus: '',
        validityPeriod: 0,
      },
      displayStatusOptions: [
        { title: '활성', value: 'T' },
        { title: '비활성', value: 'F' },
      ],
    };
  },
  methods: {
    ...mapActions('coupon', ['createCoupon']),
    async saveCoupon() {
      if (this.valid) {
        try {
          await this.createCoupon(this.coupon);
          this.$emit('save');
          alert('쿠폰이 등록되었습니다.');
        } catch (error) {
          console.error('쿠폰 등록 실패:', error);
          alert('쿠폰 등록에 실패했습니다.');
        }
      }
    },
  },
};
</script>
