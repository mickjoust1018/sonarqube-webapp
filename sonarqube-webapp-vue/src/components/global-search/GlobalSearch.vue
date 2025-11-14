<template>
  <div class="global-search" ref="searchRef">
    <el-button :icon="Search" circle @click="handleSearchClick" class="search-trigger" />
    <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      width="600px"
      class="search-dialog"
      @close="handleClose"
    >
      <template #header>
        <el-input
          v-model="query"
          :placeholder="'搜索项目...'"
          :prefix-icon="Search"
          clearable
          @input="handleQueryChange"
          @keydown="handleKeyDown"
          ref="inputRef"
          class="search-input"
        />
      </template>
      <div class="search-results">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>搜索中...</span>
        </div>
        <div v-else-if="!query || query.length < 2" class="empty-state">
          <p>输入至少 2 个字符开始搜索</p>
        </div>
        <div v-else-if="results.length === 0" class="empty-state">
          <p>未找到结果</p>
        </div>
        <div v-else class="results-list">
          <div
            v-for="(result, index) in results"
            :key="result.key"
            :class="['result-item', { active: selectedIndex === index }]"
            @click="handleResultClick(result)"
            @mouseenter="selectedIndex = index"
          >
            <el-icon><Document /></el-icon>
            <div class="result-content">
              <div class="result-name">{{ result.name }}</div>
              <div class="result-key">{{ result.key }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Document, Loading } from '@element-plus/icons-vue'
import { getSuggestions } from '@/libs/commons/api/components'
import { debounce } from 'lodash-es'

interface SearchResult {
  key: string
  name: string
  qualifier: string
}

const router = useRouter()
const searchRef = ref<HTMLElement>()
const inputRef = ref<HTMLElement>()
const dialogVisible = ref(false)
const query = ref('')
const results = ref<SearchResult[]>([])
const loading = ref(false)
const selectedIndex = ref(0)

const MIN_SEARCH_QUERY_LENGTH = 2

// 防抖搜索
const debouncedSearch = debounce(async (searchQuery: string) => {
  if (searchQuery.length < MIN_SEARCH_QUERY_LENGTH) {
    results.value = []
    loading.value = false
    return
  }

  loading.value = true
  try {
    const response = await getSuggestions(searchQuery, [])
    const allResults: SearchResult[] = []

    response.results.forEach(group => {
      group.items.forEach(item => {
        allResults.push({
          key: item.key,
          name: item.name,
          qualifier: group.q,
        })
      })
    })

    results.value = allResults
    selectedIndex.value = 0
  } catch (error) {
    console.error('Search failed:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}, 300)

function handleSearchClick() {
  dialogVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleClose() {
  dialogVisible.value = false
  query.value = ''
  results.value = []
  selectedIndex.value = 0
}

function handleQueryChange() {
  loading.value = true
  debouncedSearch(query.value)
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    handleClose()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (selectedIndex.value < results.value.length - 1) {
      selectedIndex.value++
    }
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    }
    return
  }

  if (event.key === 'Enter' && results.value.length > 0) {
    event.preventDefault()
    handleResultClick(results.value[selectedIndex.value])
  }
}

function handleResultClick(result: SearchResult) {
  router.push(`/project/${result.key}`)
  handleClose()
}

// 键盘快捷键（Ctrl+K 或 Cmd+K）
function handleKeyboardShortcut(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    handleSearchClick()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyboardShortcut)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcut)
  debouncedSearch.cancel()
})
</script>

<style scoped>
.global-search {
  position: relative;
}

.search-trigger {
  border: none;
  background: transparent;
}

.search-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.search-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.search-input {
  width: 100%;
}

.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.loading,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.loading .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.results-list {
  padding: 8px 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover,
.result-item.active {
  background-color: #f5f7fa;
}

.result-item .el-icon {
  margin-right: 12px;
  color: #909399;
  font-size: 18px;
}

.result-content {
  flex: 1;
}

.result-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.result-key {
  font-size: 12px;
  color: #909399;
}
</style>
