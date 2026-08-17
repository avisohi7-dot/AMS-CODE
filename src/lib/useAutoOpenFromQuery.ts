import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useAutoOpenFromQuery(openCreate: () => void) {
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate()
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
