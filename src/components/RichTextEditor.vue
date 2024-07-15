<template>
  <div>

    <h5>첨부된 이미지</h5>

    <div style="border: 1px solid gray">
      <div v-for="image in images" :key="image.url" class="attached-img-container">
        <div class="attached-img">
          <img :src="image.url" alt="Review Image" style="width: 100px;">
          <button style="margin-top:10px;" class="small-btn" @click="removeImage(image.name)">삭제</button>
        </div>
      </div>
    </div>
    <QuillEditor ref="quillEditor" v-model="content" :options="mergedEditorOptions" />

  </div>
</template>

<script>
import { ref, watch, defineComponent, onMounted, computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import axios from '@/axios';
// import { v4 as uuidv4 } from 'uuid'; // 이미지 중복 저장 방지를 위한 고유 식별자 uuid 부여

export default defineComponent({
  name: 'RichTextEditor',
  components: {
    QuillEditor
  },
  props: {
    modelValue: {
      type: String,
      required: true
    },
    editorOptions: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { emit }) {
    const content = ref(props.modelValue);
    const quillEditor = ref(null);
    const images = ref([]);

    const defaultEditorOptions = {
      placeholder: 'Write something...',
      modules: {
        toolbar: {
          container: [
            [{ 'header': [false] }, 'image']
          ],
          handlers: {
            image: () => {
              // 이미지 핸들러 로직
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();

              input.onchange = async () => {
                const file = input.files[0];
                const fileName = decodeURIComponent(file.name); // 디코딩

                console.log('Selected file:', file);
                console.log('Decoded file name:', fileName);

                // 파일 업로드
                const formData = new FormData();
                formData.append('file', file);

                // 이미 존재하는 이미지인지 확인
                if (!images.value.some(img => decodeURIComponent(img.name) === fileName)) {
                  const formData = new FormData();
                  formData.append('file', file);

                  try {
                    const response = await axios.post('/api/upload/image', formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data'
                      }
                    });
                    
                    const url = response.data;
                    const decodedUrl = decodeURIComponent(url);

                    console.log('Server response URL:', url);
                    console.log('Decoded URL:', decodedUrl);

                    if (!url) {
                      throw new Error('Image URL is undefined');
                    }

                    // 절대 경로인 경우와 상대 경로인 경우를 처리
                    const imageUrl = url.startsWith('http') ? url : `http://localhost:9095${url}`; 

                    images.value.push({ url: imageUrl, name: file.name }); // 에디터에 삽입하지 않고 배열에만 추가
                    console.log('Current images after upload:', images.value);

                    // Quill 에디터에 이미지 삽입하고 display: none 스타일 적용
                    if (quillEditor.value) {
                      const quill = quillEditor.value.getQuill();
                      const length = quill.getLength(); // 수정된 부분
                      quill.insertEmbed(length - 1, 'image', imageUrl); // 마지막 위치에 이미지 삽입

                      // 이미지 태그에 display: none 스타일 적용
                      const img = quill.root.querySelector(`img[src="${imageUrl}"]`);
                      if (img) {
                        img.style.display = 'none';
                      }
                    }

                    // 이미지가 추가된 후 HTML 컨텐츠 업데이트
                    updateContent();

                  } catch (error) {
                    console.error('이미지 업로드 실패:', error);
                  }
                } else {
                  console.log('이미 존재하는 이미지:', fileName);
                }
              };
            }
          }
        }
      },
      ...props.editorOptions
    };

    // 병합된 에디터 옵션
    const mergedEditorOptions = computed(() => ({
      ...defaultEditorOptions,
      ...props.editorOptions
    }));

    // 이미지 제거
    const removeImage = async (name) => {
      const imageToRemove = images.value.find(img => img.name === name);
      if (imageToRemove) {
        try {
          await axios.delete(`/api/delete/image`, { data: { url: imageToRemove.url } });
          images.value = images.value.filter(img => img.name !== name);
          console.log('After removing image:', images.value);
          
          // HTML 내용에서 이미지 태그 제거
          if (quillEditor.value) {
            const quill = quillEditor.value.getQuill();
            const parser = new DOMParser();
            const doc = parser.parseFromString(quill.root.innerHTML, 'text/html');
            const imgTags = doc.querySelectorAll('img');
            imgTags.forEach(img => {
              if (img.src === imageToRemove.url) {
                img.remove();
              }
            });
            quill.root.innerHTML = doc.body.innerHTML;
            updateContent();
          }

        } catch (error) {
          console.error('Image delete failed:', error);
        }
      }
    };

    const updateContent = () => {
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();
        let contentHtml = quill.root.innerHTML;

        // <br> 태그를 \n으로 변환
        contentHtml = contentHtml.replace(/<br>/g, '\n');

        // \n을 <br>로 변환
        contentHtml = contentHtml.replace(/\n/g, '<br>');
        
        content.value = contentHtml;
        emit('update:modelValue', content.value);
        console.log('Content updated:', content.value);

        // HTML 내용에서 이미지를 파싱하여 images 배열에 추가
        const parser = new DOMParser();
        const doc = parser.parseFromString(content.value, 'text/html');
        const imgTags = doc.querySelectorAll('img');
        images.value = Array.from(imgTags).map(img => ({
          url: img.src,
          name: decodeURIComponent(img.src.split('/').pop())
        }));
        console.log('Images after content update:', images.value);

        // HTML에서 이미지 태그 제거
        // imgTags.forEach(img => img.remove());
        // quill.root.innerHTML = doc.body.innerHTML;
        // console.log('HTML after removing images:', quill.root.innerHTML);
      }
    };

    watch(content, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(() => props.modelValue, (newValue) => {
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();
        if (quill.root.innerHTML !== newValue) {
          quill.root.innerHTML = newValue;
          // HTML 내용에서 이미지를 파싱하여 images 배열에 추가
          const parser = new DOMParser();
          const doc = parser.parseFromString(newValue, 'text/html');
          const imgTags = doc.querySelectorAll('img');
          images.value = Array.from(imgTags).map(img => ({
            url: img.src,
            name: img.src.split('/').pop()
          }));
          console.log('Images after prop modelValue change:', images.value);
        }
      }
      content.value = newValue;
    });

    // 컴포넌트 마운트 시 실행
    onMounted(() => {
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();

        quill.on('text-change', () => {
          content.value = quill.root.innerHTML;
        });

        // MutationObserver를 사용하여 DOM 변경 사항을 감지합니다.
        const observer = new MutationObserver(() => {
          content.value = quill.root.innerHTML;
        });

        observer.observe(quill.root, {
          childList: true,
          subtree: true,
          characterData: true
        });

        quill.root.innerHTML = content.value;

        const doc = new DOMParser().parseFromString(content.value, 'text/html');
        const imgTags = doc.querySelectorAll('img');
        images.value = Array.from(imgTags).map(img => ({
          url: img.src,
          name: img.src.split('/').pop()
        }));
        console.log('Initial images on mount:', images.value);
      }
    });

    return {
      content,
      mergedEditorOptions,
      quillEditor,
      images,
      removeImage
    };
  }
});
</script>

<style>
.attached-img-container {
  display: inline-block;
  margin: 5px;
  border-radius: 20px;
  padding: 10px;
}
.attached-img {
  display: flex;
  flex-direction: column;
}
</style>
