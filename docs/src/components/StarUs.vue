<script setup lang="ts">
import { computed } from 'vue'
import { data } from './stargazers.data'

const repoUrl = 'https://github.com/Santymax98/VineCopulas.jl'

const formattedStars = computed(() => {
  if (typeof data !== 'number' || !Number.isFinite(data)) return ''

  return new Intl.NumberFormat('en', {
    notation: data >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(data)
})

const title = computed(() =>
  typeof data === 'number'
    ? `${data.toLocaleString('en-US')} GitHub stars`
    : 'Star VineCopulas.jl on GitHub',
)
</script>

<template>
  <a
    class="vine-stars"
    :href="repoUrl"
    target="_blank"
    rel="noopener noreferrer"
    :title="title"
    aria-label="VineCopulas.jl GitHub stars"
  >
    <svg
      class="github-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 .297C5.375.297 0 5.673 0 12.3c0 5.292
        3.438 9.8 8.207 11.387.6.11.793-.26.793-.577
        0-.285-.01-1.04-.015-2.04-3.338.727-4.042-1.61-4.042-1.61
        -.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729
        1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305
        3.493.997.107-.774.42-1.305.762-1.605-2.665-.3-5.467-1.333
        -5.467-5.931 0-1.31.47-2.382 1.236-3.222-.123-.303-.535-1.52
        .117-3.166 0 0 1.01-.323 3.31 1.23.96-.267 1.98-.4
        3-.405 1.02.005 2.04.138 3 .405 2.3-1.553 3.31-1.23
        3.31-1.23.653 1.646.24 2.863.117 3.166.765.84
        1.236 1.912 1.236 3.222 0 4.61-2.807 5.625-5.477
        5.921.43.372.823 1.102.823 2.222 0 1.606-.015
        2.902-.015 3.293 0 .32.192.693.8.577C20.565
        22.1 24 17.588 24 12.297 24 5.673 18.627.297 12 .297z"
      />
    </svg>

    <span v-if="formattedStars" class="count">
      {{ formattedStars }}
    </span>

    <span class="star" aria-hidden="true">★</span>
  </a>
</template>

<style scoped>
.vine-stars {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-left: 0.35rem;
  padding: 0.25rem 0.45rem;
  border-radius: 8px;

  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
  line-height: 1;

  text-decoration: none;
  white-space: nowrap;

  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.vine-stars:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  transform: translateY(-1px);
}

.github-icon {
  flex-shrink: 0;
}

.count {
  min-width: 0.8rem;
  text-align: center;
}

.star {
  color: var(--vp-c-brand-1);
  font-size: 16px;
  line-height: 1;
}

@media (max-width: 700px) {
  .count,
  .star {
    display: none;
  }

  .vine-stars {
    padding-inline: 0.25rem;
  }
}
</style>
