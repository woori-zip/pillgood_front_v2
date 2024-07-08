<template>
  <div>
    <QuillEditor ref="quillEditor" v-model="content" :options="editorOptions" />
  </div>
</template>

<script>
import { ref, watch, defineComponent, onMounted, nextTick } from 'vue';
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
          // 업로드할 API 경로 설정8888
          const response = await axios.post('/api/upload/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          const url = response.data; // 서버에서 반환할 이미지 url을 가져옴
          const range = quillEditor.value.getQuill().getSelection();
          if (range) {
            quillEditor.value.getQuill().insertEmbed(range.index, 'image', `http://localhost:9095${url}`); // URL 삽입
            quillEditor.value.getQuill().setSelection(range.index + 1); // 이미지 다음 위치로 커서 이동
            updateContent(); // 내용 업데이트
          }
        } catch (error) {
          console.error('Image upload failed:', error);
        }
      };
    };

    const updateContent = () => {
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();
        content.value = quill.root.innerHTML;
        emit('update:modelValue', content.value);
      }
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
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();
        if (quill.root.innerHTML !== newValue) {
          quill.root.innerHTML = newValue;
        }
      }
      content.value = newValue;
      nextTick(() => {
        if (quillEditor.value) {
          quillEditor.value.getQuill().setContents(quillEditor.value.getQuill().clipboard.convert(content.value));
        }
      });
    });

    onMounted(() => {
      if (quillEditor.value) {

        const quill = quillEditor.value.getQuill();
        quill.on('text-change', () => {
          const editorContent = quill.root.innerHTML;
          console.log('에디터 내용 변경:', editorContent);
          content.value = editorContent;
        });

        // MutationObserver 사용
        const observer = new MutationObserver(() => {
          const editorContent = quill.root.innerHTML;
          console.log('MutationObserver 감지됨:', editorContent);
          content.value = editorContent;
        });

        observer.observe(quill.root, {
          childList: true,
          subtree: true,
          characterData: true
        });

        // 초기 내용을 설정
        quill.root.innerHTML = content.value;
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
