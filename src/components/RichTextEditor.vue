<template>
  <div>
    <QuillEditor ref="quillEditor" v-model="content" :options="editorOptions" />
  </div>
</template>

<script>
import { ref, watch, defineComponent, onMounted } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import axios from '@/axios';

export default defineComponent({
  name: 'RichTextEditor',
  components: {
    QuillEditor
  },
  props: {
    modelValue: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const content = ref(props.modelValue);
    const quillEditor = ref(null);

    // 이미지 핸들러 정의
    const imageHandler = () => {
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
          // 업로드할 API 경로 설정
          const response = await axios.post('/upload/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          const url = response.data;
          const range = quillEditor.value.getQuill().getSelection();
          quillEditor.value.getQuill().insertEmbed(range.index, 'image',`http://localhost:9095${url}`); // URL 앞에 서버 주소 추가
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      };
    };

    const editorOptions = {
      placeholder: 'Write something...',
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'code-block']
          ],
          handlers: {
            image: imageHandler
          }
        }
      }
    };

    watch(content, (newValue) => {
      console.log('content 변경됨:', newValue);
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      console.log('modelValue 변경됨:', newValue);
      content.value = newValue;
    });

    onMounted(() => {
      if (quillEditor.value) {
        quillEditor.value.getQuill().on('text-change', () => {
          const editorContent = quillEditor.value.getQuill().root.innerHTML;
          console.log('에디터 내용 변경:', editorContent);
          content.value = editorContent;
        });
      }
    });

    return {
      content,
      editorOptions,
      quillEditor
    };
  }
});
</script>

<style>
/* 필요한 스타일링을 추가할 수 있음 */
</style>
