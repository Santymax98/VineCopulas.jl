<script setup lang="ts">
import { computed, ref } from 'vue'

const copied = ref(false)
const command = 'Pkg.add("VineCopulas")'

const tooltip = computed(() =>
  copied.value
    ? 'Copied!'
    : 'Copy Pkg.add("VineCopulas")'
)

async function copyInstall() {
  try {
    await navigator.clipboard.writeText(command)
    copied.value = true

    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <button
    class="pkg-install"
    type="button"
    :title="tooltip"
    aria-label="Copy VineCopulas installation command"
    @click="copyInstall"
  >
    <svg
      class="terminal-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M4 5.5 9.5 12 4 18.5l1.5 1.25L12 12 5.5 4.25 4 5.5ZM12 18h8v2h-8v-2Z"
      />
    </svg>

    <span class="label">
      {{ copied ? 'Copied!' : 'Pkg' }}
    </span>
  </button>
</template>

<style scoped>
.pkg-install {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;

  margin-left: 0.15rem;
  padding: 0.28rem 0.5rem;

  border: 0;
  border-radius: 8px;
  background: transparent;

  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;

  cursor: pointer;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.pkg-install:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  transform: translateY(-1px);
}

.terminal-icon {
  flex-shrink: 0;
}

@media (max-width: 760px) {
  .label {
    display: none;
  }

  .pkg-install {
    padding-inline: 0.3rem;
  }
}
</style>