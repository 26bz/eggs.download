<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
</script>

<template>
  <UApp>
    <UMain>
      <UError :error="props.error" redirect="/">
        <template #links>
          <UButton to="/" color="primary" variant="solid" icon="i-lucide-home"> Back home </UButton>
        </template>
      </UError>
    </UMain>
  </UApp>
</template>
