<script setup>
import { ref } from 'vue'
import BaseModal from './base/BaseModal.vue'
import BaseButton from './base/BaseButton.vue'
import BaseBadge from './base/BaseBadge.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Import CSV Data' },
  requiredFields: { type: Array, default: () => ['name'] } // e.g. ['name', 'email'] or ['name', 'price']
})

const emit = defineEmits(['close', 'import'])

const fileInputRef = ref(null)
const fileName = ref('')
const validRows = ref([])
const invalidCount = ref(0)
const isParsed = ref(false)

const resetImportState = () => {
  fileName.value = ''
  validRows.value = []
  invalidCount.value = 0
  isParsed.value = false
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return

  fileName.value = file.name
  const reader = new FileReader()

  reader.onload = (event) => {
    const text = event.target.result
    parseCsvText(text)
  }
  reader.readAsText(file)
}

const parseCsvText = (text) => {
  const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '')
  if (lines.length < 2) {
    invalidCount.value = lines.length
    validRows.value = []
    isParsed.value = true
    return
  }

  // Parse header row
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
  
  const parsedValid = []
  let invalidCountVal = 0

  for (let i = 1; i < lines.length; i++) {
    const currentLine = lines[i].split(',').map(val => val.trim().replace(/^["']|["']$/g, ''))
    if (currentLine.length < headers.length) {
      invalidCountVal++
      continue
    }

    const rowObj = {}
    headers.forEach((header, index) => {
      rowObj[header] = currentLine[index] || ''
    })

    // Validate required fields
    const isValid = props.requiredFields.every(field => {
      const val = rowObj[field]
      return val !== undefined && val !== null && String(val).trim() !== ''
    })

    if (isValid) {
      parsedValid.value = rowObj // standard formatting
      parsedValid.push(rowObj)
    } else {
      invalidCountVal++
    }
  }

  validRows.value = parsedValid
  invalidCount.value = invalidCountVal
  isParsed.value = true
}

const handleConfirm = () => {
  if (validRows.value.length === 0) return
  emit('import', validRows.value)
  resetImportState()
}

const handleClose = () => {
  resetImportState()
  emit('close')
}
</script>

<template>
  <BaseModal
    :show="show"
    :title="title"
    subtitle="Upload a CSV file to bulk import records with automatic validation."
    @close="handleClose"
  >
    <div class="vstack gap-3">
      <!-- File Picker Input -->
      <div v-if="!isParsed">
        <label class="form-label small fw-semibold text-dark">Select CSV File</label>
        <input
          type="file"
          class="form-control"
          accept=".csv"
          ref="fileInputRef"
          @change="handleFileChange"
        />
        <div class="form-text small text-muted mt-1">
          Required fields: <strong>{{ requiredFields.join(', ') }}</strong>. Rows missing these fields will be skipped.
        </div>
      </div>

      <!-- Preview Summary Card -->
      <div v-else class="vstack gap-3">
        <div class="p-3 bg-light rounded border">
          <div class="fw-semibold text-dark mb-2">Import Preview Summary</div>
          <div class="d-flex gap-3">
            <div class="d-flex align-items-center gap-2">
              <BaseBadge variant="success">{{ validRows.length }}</BaseBadge>
              <span class="small text-secondary">Valid rows ready to import</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <BaseBadge variant="danger">{{ invalidCount }}</BaseBadge>
              <span class="small text-secondary">Invalid rows skipped</span>
            </div>
          </div>
        </div>

        <div v-if="validRows.length > 0" class="table-responsive border rounded" style="max-height: 200px; overflow-y: auto;">
          <table class="table table-sm table-striped mb-0 small">
            <thead>
              <tr>
                <th v-for="(val, key) in validRows[0]" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in validRows.slice(0, 5)" :key="idx">
                <td v-for="(val, key) in row" :key="key">{{ val }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="validRows.length > 5" class="p-2 text-center bg-white text-muted small border-top">
            Showing first 5 of {{ validRows.length }} valid records...
          </div>
        </div>

        <div class="text-end">
          <button type="button" class="btn btn-link btn-sm text-secondary p-0" @click="resetImportState">
            Choose a different file
          </button>
        </div>
      </div>

      <!-- Modal Footer Actions -->
      <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
        <BaseButton
          type="button"
          variant="secondary"
          size="sm"
          text="Cancel"
          @click="handleClose"
        />
        <BaseButton
          type="button"
          variant="primary"
          size="sm"
          text="Confirm Import"
          icon="bi bi-cloud-arrow-up"
          :disabled="!isParsed || validRows.length === 0"
          @click="handleConfirm"
        />
      </div>
    </div>
  </BaseModal>
</template>