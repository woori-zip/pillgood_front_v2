<template>
  <div class="main-container">
    <h2 class="text-melon">배송지 관리</h2>
    <div class="breadcrumb">
      <p><a href="/mypage">> 마이페이지로 돌아가기</a></p>
    </div>
    <div class="box-container-no-shade">
    <div v-if="addresses && addresses.length > 0" class="address-list">
      <ul>
        <li v-for="address in addresses" :key="address.shippingAddrId" class="address-item">
          <p
            class="address-title"
            :class="{ 'selected': selectedAddressId === address.shippingAddrId }"
            @click="toggleAddressDetails(address.shippingAddrId)"
          >
            <strong>[{{ address.shippingName }}]</strong> {{ address.address }} {{ address.detailedAddress }} ({{ address.postalCode }})
          </p>
          <div v-if="selectedAddressId === address.shippingAddrId" class="address-details">
            <table>
              <tr>
                <td><label for="shippingName">배송지명</label></td>
                <td><input type="text" v-model="editableAddress.shippingName" required /></td>
              </tr>
              <tr>
                <td><label for="postalCode">우편번호</label></td>
                <td>
                  <div class="postal-code-input">
                    <input type="text" v-model="editableAddress.postalCode" required readonly />
                    <button ref="editPostcodeButton" type="button" @click="openDaumPostcode('editable')" class="btn btn-green">우편번호 찾기</button>
                  </div>
                </td>
              </tr>
              <tr>
                <td><label for="address">주소</label></td>
                <td><input type="text" v-model="editableAddress.address" required readonly /></td>
              </tr>
              <tr>
                <td><label for="detailedAddress">상세 주소</label></td>
                <td><input type="text" v-model="editableAddress.detailedAddress" required /></td>
              </tr>
              <tr>
                <td colspan="2">
                  <div class="btn-container">
                    <button @click="updateExistingAddress" class="btn btn-green">수정</button>
                    <button @click="deleteAddress(address.shippingAddrId)" class="btn btn-red">삭제</button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>배송지를 등록해 주세요.</p>
    </div>
    <div class="btn-container">
    <button @click="showAddressForm = true" class="btn btn-green">추가</button>
    </div>
    <div v-if="showAddressForm" class="box-container">
      <h5 class="text-melon">새로운 배송지 추가</h5>
      <form @submit.prevent="addNewAddress">
        <table>
          <tr>
            <td><label for="shippingName">배송지명</label></td>
            <td><input type="text" v-model="newAddress.shippingName" required /></td>
          </tr>
          <tr>
            <td><label for="postalCode">우편번호</label></td>
            <td>
              <div class="postal-code-input">
                <input type="text" v-model="newAddress.postalCode" required readonly />
                <button ref="newPostcodeButton" type="button" @click="openDaumPostcode('new')" class="btn btn-green">우편번호 찾기</button>
              </div>
            </td>
          </tr>
          <tr>
            <td><label for="address">주소</label></td>
            <td><input type="text" v-model="newAddress.address" required readonly /></td>
          </tr>
          <tr>
            <td><label for="detailedAddress">상세 주소</label></td>
            <td><input type="text" v-model="newAddress.detailedAddress" required /></td>
          </tr>
          <tr>
            <td><label for="extraAddress">참고항목</label></td>
            <td><input type="text" v-model="newAddress.extraAddress" readonly /></td>
          </tr>
          <tr>
            <td colspan="2">
              <div class="btn-container">
                <button type="submit" class="btn btn-green">저장</button>
                <button type="button" @click="showAddressForm = false" class="btn btn-gray">취소</button>
              </div>
            </td>
          </tr>
        </table>
      </form>
    </div>
    <div ref="wrap" style="display:none;border:1px solid;width:500px;height:300px;margin:5px 0;position:relative">
      <img src="//t1.daumcdn.net/postcode/resource/images/close.png" id="btnFoldWrap" style="cursor:pointer;position:absolute;right:0px;top:-1px;z-index:1" @click="foldDaumPostcode" alt="접기 버튼">
    </div>
  </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import '../assets/styles.css';

export default {
  name: 'ShippingAddressManager',
  data() {
    return {
      showAddressForm: false,
      selectedAddressId: null,
      newAddress: {
        shippingName: '',
        postalCode: '',
        address: '',
        detailedAddress: '',
        extraAddress: ''
      },
      editableAddress: {
        shippingName: '',
        postalCode: '',
        address: '',
        detailedAddress: '',
        extraAddress: ''
      }
    };
  },
  computed: {
    ...mapState('shipping', ['addresses'])
  },
  created() {
    this.fetchAddresses();
  },
  methods: {
    ...mapActions('shipping', ['fetchAddresses', 'addAddress', 'removeAddress', 'updateAddress']),
    toggleAddressDetails(addressId) {
      if (this.selectedAddressId === addressId) {
        this.selectedAddressId = null;
      } else {
        this.selectedAddressId = addressId;
        const selectedAddress = this.addresses.find(address => address.shippingAddrId === addressId);
        this.editableAddress = { ...selectedAddress };
      }
    },
    async addNewAddress() {
      try {
        const existingAddress = this.addresses.find(
          address =>
            address.postalCode === this.newAddress.postalCode &&
            address.address === this.newAddress.address &&
            address.detailedAddress === this.newAddress.detailedAddress
        );

        if (existingAddress) {
          alert('이미 동일한 주소가 존재합니다.');
          return;
        }

        await this.addAddress(this.newAddress);
        this.showAddressForm = false;
        this.newAddress = {
          shippingName: '',
          postalCode: '',
          address: '',
          detailedAddress: '',
          extraAddress: ''
        };
      } catch (error) {
        console.error('새로운 배송지 추가 중 오류 발생:', error);
      }
    },
    async updateExistingAddress() {
      try {
        await this.updateAddress(this.editableAddress);
        this.selectedAddressId = null;
        this.fetchAddresses();  // 수정 후 주소 목록을 새로고침
      } catch (error) {
        console.error('배송지 수정 중 오류 발생:', error);
      }
    },
    async deleteAddress(addressId) {
      try {
        await this.removeAddress(addressId);
        this.fetchAddresses();  // 삭제 후 주소 목록을 새로고침
      } catch (error) {
        console.error('배송지 삭제 중 오류 발생:', error);
      }
    },
    openDaumPostcode(type) {
      const elementWrap = this.$refs.wrap;
      const currentScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      new window.daum.Postcode({
        oncomplete: (data) => {
          let addr = '';
          let extraAddr = '';

          if (data.userSelectedType === 'R') {
            addr = data.roadAddress;
          } else {
            addr = data.jibunAddress;
          }

          if (data.userSelectedType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddr += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
            }
            if (extraAddr !== '') {
              extraAddr = ' (' + extraAddr + ')';
            }
          }

          if (type === 'new') {
            this.newAddress.postalCode = data.zonecode;
            this.newAddress.address = addr;
            this.newAddress.extraAddress = extraAddr;
          } else {
            this.editableAddress.postalCode = data.zonecode;
            this.editableAddress.address = addr;
            this.editableAddress.extraAddress = extraAddr;
          }

          elementWrap.style.display = 'none';
          document.body.scrollTop = currentScroll;
        },
        onresize: (size) => {
          elementWrap.style.height = size.height + 'px';
        },
        width: '100%',
        height: '100%'
      }).embed(elementWrap);
      
      // 위치 계산 부분을 수정
      const targetElement = type === 'new' ? this.$refs.newPostcodeButton : this.$refs.editPostcodeButton[0];
      if (targetElement && targetElement.getBoundingClientRect) {
        const rect = targetElement.getBoundingClientRect();
        elementWrap.style.position = 'absolute';
        elementWrap.style.top = `${rect.bottom + window.scrollY}px`;
        elementWrap.style.left = `${rect.left + window.scrollX}px`;
      }

      elementWrap.style.zIndex = '1000';

      elementWrap.style.display = 'block';
    },
    foldDaumPostcode() {
      const elementWrap = this.$refs.wrap;
      elementWrap.style.display = 'none';
    }
  }
};
</script>

<style scoped>
.address-manager {
  padding: 20px;
}
.address-list ul {
  list-style-type: none;
  padding: 0;
}
.address-item {
  margin-bottom: 20px;
}
.address-title {
  cursor: pointer;
  margin: 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
.address-title.selected {
  background-color: #c6edc2;
}
.address-title:hover {
  background-color: #f1f1f1;
}
.address-details {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fafafa;
  margin-top: 10px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.address-form {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fafafa;
}
.box-container-no-shade .postal-code-input {
  display: flex;
  justify-content: flex-start; 
  align-items: center;
}

.box-container-no-shade .postal-code-input input {
  display: flex;
  justify-content: flex-start; 
  align-items: center;
  width: 50% !important; 
  margin-right: 10px;
  box-sizing: border-box; 
}

.box-container-no-shade .postal-code-input button {
  flex-shrink: 0; 
  white-space: nowrap; 
}
.postal-code-field {
  margin-right: 10px;
}
.error {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

.breadcrumb {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}

.breadcrumb a {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 20px;
}
</style>
