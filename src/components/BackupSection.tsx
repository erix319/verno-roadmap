import { useState } from 'react'

interface BackupSectionProps {
  onExport: () => string
  onImport: (raw: string) => boolean
}

export function BackupSection({ onExport, onImport }: BackupSectionProps) {
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')

  const doExport = async () => {
    const data = onExport()
    setValue(data)
    try {
      await navigator.clipboard.writeText(data)
      setMessage('Скопировано в буфер. Перешли строку себе (например, в «Избранное» в Telegram) и вставь на другом устройстве.')
    } catch {
      setMessage('Строка в поле ниже — скопируй её вручную.')
    }
  }

  const doImport = () => {
    if (!value.trim()) {
      setMessage('Сначала вставь строку резервной копии в поле.')
      return
    }
    setMessage(
      onImport(value.trim())
        ? 'Готово: галочки, отложенные шаги, настройки и напоминалки применены.'
        : 'Не получилось разобрать строку — проверь, что это полная копия из этого раздела.',
    )
  }

  return (
    <section className="page-section" aria-labelledby="backup-title">
      <div className="page-section__header">
        <h2 id="backup-title">Перенос между устройствами</h2>
        <p className="section-lead">
          Прогресс хранится в localStorage конкретного браузера. Экспорт собирает всё (галочки, отложенные, настройки, напоминалки) в одну строку — импорт на другом
          устройстве применяет её.
        </p>
      </div>
      <textarea
        className="backup__area"
        rows={3}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Сюда ляжет строка экспорта — или вставь копию с другого устройства"
        aria-label="Строка резервной копии"
      />
      <div className="backup__actions">
        <button type="button" className="button" onClick={doExport}>
          Экспортировать
        </button>
        <button type="button" className="button" onClick={doImport}>
          Импортировать
        </button>
      </div>
      {message && (
        <p className="backup__message" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
