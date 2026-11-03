import { reactive, computed } from 'vue'

export class ProductFormViewModel {
  constructor(initialData = {}, onSubmitCallback) {
    // 1. Centralized Form State
    this.form = reactive({
      name: initialData.name || '',
      price: initialData.price || '',
      category: initialData.category || ''
    })

    this.onSubmitCallback = onSubmitCallback
  }

  // 2. Computed validation or helper rules
  get isValid() {
    return this.form.name.trim() !== '' && this.form.price > 0
  }

  // 3. Action methods
  async submit() {
    if (!this.isValid) {
      alert('Please fill in all required fields properly.')
      return
    }

    try {
      // Pass form data to your submit callback (e.g., API call)
      await this.onSubmitCallback(this.form)
    } catch (error) {
      console.error('Submission failed:', error)
    }
  }

  reset() {
    this.form.name = ''
    this.form.price = ''
    this.form.category = ''
  }
}