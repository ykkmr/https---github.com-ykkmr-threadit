<!-- PERIPHERAL_FEATURES.md §1 — 사이드 광고 슬롯
     - IntersectionObserver로 화면에 보일 때만 렌더링 (Lazy Loading)
     - min-height 미리 확보 → CLS(Cumulative Layout Shift) 방지
     - 광고 스크립트는 defer/async 속성 필수
-->
<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  adUnit: { type: String, default: 'default' },   // 광고 단위 ID
  minHeight: { type: String, default: '250px' },  // CLS 방지용 최소 높이
})

const slotRef = ref(null)
const visible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      visible.value = true
      observer.disconnect()
      // TODO: Google AdSense / 자체 광고 스크립트 동적 삽입
    }
  })
  if (slotRef.value) observer.observe(slotRef.value)
})
</script>

<template>
  <div ref="slotRef" class="ad-slot" :style="{ minHeight }">
    <div v-if="visible" class="ad-content">
      <!-- 광고 삽입 영역 — 실제 광고 스크립트로 교체 -->
      <span class="ad-label">광고</span>
    </div>
  </div>
</template>

<style scoped>
.ad-slot {
  width: 100%;
  background: #fafafa;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ad-label { font-size: 11px; color: #ccc; }
</style>
