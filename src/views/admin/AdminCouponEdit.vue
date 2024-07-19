<template>
  <v-card>
    <v-card-title>
      <h2>쿠폰 수정</h2>
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-text-field v-model="editableCoupon.couponName" label="쿠폰 이름" required></v-text-field>
        <v-text-field v-model="editableCoupon.discountAmount" label="할인 금액" type="number" required></v-text-field>
        <v-text-field v-model="editableCoupon.discountDescription" label="할인 설명"></v-text-field>
        <v-select v-model="editableCoupon.couponStatus" :items="statusOptions" label="상태" required></v-select>
        <v-text-field v-model="editableCoupon.validityPeriod" label="유효 기간 (일)" type="number" required></v-text-field>
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
  name: 'AdminCouponEdit',
  props: ['coupon'],
  data() {
    return {
      editableCoupon: { ...this.coupon },
      statusOptions: ['Active', 'Inactive'],
    };
  },
  methods: {
    ...mapActions('coupon', ['updateCoupon']),
    async saveCoupon() {
      if (this.$refs.form.validate()) {
        try {
          await this.updateCoupon(this.editableCoupon);
          this.$emit('save');
          alert('쿠폰이 수정되었습니다.');
        } catch (error) {
          console.error('쿠폰 수정 실패:', error);
          alert('쿠폰 수정에 실패했습니다.');
        }
      }
    },
  },
};
</script>
