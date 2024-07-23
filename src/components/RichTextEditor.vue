<template>
  <div>
    <QuillEditor ref="quillEditor" v-model="content" :options="mergedEditorOptions" style="min-height: 100px;" />
    <div style="display: block">
      <div v-for="image in images" :key="image.url" class="attached-img-container">
        <div class="attached-img">
          <img :src="image.url" alt="Review Image" style="width: 100px;">
          <button style="margin-top:10px;" class="small-btn" @click="removeImage(image.name)">삭제</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, defineComponent, onMounted, computed } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import axios from '@/axios';

export default defineComponent({
  name: 'RichTextEditor',
  components: {
    QuillEditor,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    editorOptions: {
      type: Object,
      default: () => ({}),
    },
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
            [{ header: [false] }, 'image'],
          ],
          handlers: {
            image: () => {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'image/*');
              input.click();

              input.onchange = async () => {
                const file = input.files[0];
                const fileName = decodeURIComponent(file.name);

                const formData = new FormData();
                formData.append('file', file);

                if (!images.value.some((img) => decodeURIComponent(img.name) === fileName)) {
                  try {
                    const response = await axios.post('/api/upload/image', formData, {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    });

                    const url = response.data;
                    const imageUrl = url.startsWith('http') ? url : `http://localhost:9095${url}`;

                    images.value.push({ url: imageUrl, name: file.name });

                    if (quillEditor.value) {
                      const quill = quillEditor.value.getQuill();
                      const length = quill.getLength();
                      quill.insertEmbed(length - 1, 'image', imageUrl);

                      const img = quill.root.querySelector(`img[src="${imageUrl}"]`);
                      if (img) {
                        img.style.display = 'none';
                      }
                    }

                    updateContent();
                  } catch (error) {
                    console.error('이미지 업로드 실패:', error);
                  }
                }
              };
            },
          },
        },
      },
      ...props.editorOptions,
    };

    const mergedEditorOptions = computed(() => ({
      ...defaultEditorOptions,
      ...props.editorOptions,
    }));

    const removeImage = async (name) => {
      const imageToRemove = images.value.find((img) => img.name === name);

      if (imageToRemove) {
        try {
          await axios.delete(`/api/delete/image`, { data: { url: imageToRemove.url } });

          images.value = images.value.filter((img) => img.name !== name);

          if (quillEditor.value) {
            const quill = quillEditor.value.getQuill();
            const parser = new DOMParser();
            const doc = parser.parseFromString(quill.root.innerHTML, 'text/html');
            const imgTags = doc.querySelectorAll('img');

            imgTags.forEach((img) => {
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

        content.value = contentHtml;
        emit('update:modelValue', content.value);

        const parser = new DOMParser();
        const doc = parser.parseFromString(content.value, 'text/html');
        const imgTags = doc.querySelectorAll('img');
        images.value = Array.from(imgTags).map((img) => ({
          url: img.src,
          name: decodeURIComponent(img.src.split('/').pop()),
        }));
      }
    };

    const getTextContent = () => {
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();
        return quill.getText().trim();
      }
      return '';
    };

    watch(content, (newValue) => {
      emit('update:modelValue', newValue);
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        if (quillEditor.value) {
          const quill = quillEditor.value.getQuill();
          if (quill.root.innerHTML !== newValue) {
            quill.root.innerHTML = newValue;
            const parser = new DOMParser();
            const doc = parser.parseFromString(newValue, 'text/html');
            const imgTags = doc.querySelectorAll('img');
            images.value = Array.from(imgTags).map((img) => ({
              url: img.src,
              name: img.src.split('/').pop(),
            }));
          }
        }
        content.value = newValue;
      }
    );

    onMounted(() => {
      if (quillEditor.value) {
        const quill = quillEditor.value.getQuill();

        quill.on('text-change', () => {
          content.value = quill.root.innerHTML;
          emit('text-change', quill.getText().trim());
        });

        const observer = new MutationObserver(() => {
          content.value = quill.root.innerHTML;
        });

        observer.observe(quill.root, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        quill.root.innerHTML = content.value;

        const doc = new DOMParser().parseFromString(content.value, 'text/html');
        const imgTags = doc.querySelectorAll('img');
        images.value = Array.from(imgTags).map((img) => ({
          url: img.src,
          name: img.src.split('/').pop(),
        }));
      }
    });

    return {
      content,
      mergedEditorOptions,
      quillEditor,
      images,
      removeImage,
      getTextContent
    };
  },
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
  display: inline-flex;
  flex-direction: column;
}
</style>
