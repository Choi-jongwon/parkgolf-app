import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { MOCK_COURSES } from '../lib/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export function useCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (USE_MOCK) {
      setCourses(MOCK_COURSES)
      setLoading(false)
      return
    }

    async function fetch() {
      setLoading(true)
      const { data, error } = await supabase
        .from('golf_courses')
        .select('*')
        .order('name')

      if (error) setError(error.message)
      else       setCourses(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return { courses, loading, error }
}
