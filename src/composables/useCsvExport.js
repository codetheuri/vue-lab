export function useCsvExport() {
  const exportToCsv = (rows, headers, filename = 'export.csv') => {
    if (!rows || rows.length === 0) return false

    const csvRows = [
      headers.join(','),
      ...rows.map(row => 
        headers.map(field => JSON.stringify(row[field] ?? '')).join(',')
      )
    ]

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }

  return {
    exportToCsv
  }
}