<template>
  <UPage>
    <UContainer>
      <UPageHeader
        title="About eggs.download"
        description="Browse and compare Pterodactyl and Pelican eggs with unified search, details, and diffs."
      />
    </UContainer>

    <UPageBody>
      <UContainer>
        <UCard>
          <div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <p>
              eggs.download is a fun side project to tame the chaos of moving egg repos. Pterodactyl
              and Pelican keep shuffling eggs between orgs, folders, and nested paths, this gives
              you one place to search, view, and grab configs fast.
            </p>
            <div>
              <p class="font-medium text-gray-700 dark:text-gray-200">Data sources</p>
              <ul class="list-disc pl-5 space-y-1">
                <li>Pterodactyl: game-eggs, application-eggs, generic-eggs</li>
                <li>
                  Pelican: minecraft, games-steamcmd, voice, games-standalone, software, generic,
                  monitoring, chatbots, database, storage
                </li>
              </ul>
            </div>
          </div>

          <template #footer>
            <div class="flex gap-2">
              <UButton
                to="https://github.com/26bz/eggs.download"
                target="_blank"
                color="neutral"
                variant="ghost"
                icon="i-simple-icons-github"
              >
                Source
              </UButton>
              <UButton
                to="https://ko-fi.com/26bz"
                target="_blank"
                color="primary"
                variant="subtle"
                icon="i-lucide-heart"
              >
                Donate
              </UButton>
              <UButton to="/" color="neutral" variant="ghost" icon="i-lucide-arrow-left">
                Back home
              </UButton>
            </div>
          </template>
        </UCard>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
