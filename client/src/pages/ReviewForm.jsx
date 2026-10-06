
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  courseCode: '',
  rating: 5,
  comment: ''
}

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()

  const [courseCode, setCourseCode] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [availableCourses, setAvailableCourses] = useState([])

  useEffect(() => {
    if (!id) return

    async function loadReview() {
      try {
        const data = await api(`/api/reviews/${id}`)
        const review = data.review || data

        setCourseCode(review.courseCode || '')
        setRating(Number(review.rating) || 5)
        setComment(review.comment || '')
      } catch (err) {
        setError(err.message || 'Failed to load review')
      }
    }

    loadReview()
  }, [id])

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await api('/api/reviews')
        const reviews = data.reviews || []
        // Extract unique course codes from all reviews
        const codes = [...new Set(reviews.map(r => r.courseCode))].sort()
        setAvailableCourses(codes)
      } catch (err) {
        console.error('Failed to load courses list', err)
      }
    }

    fetchCourses()
  }, [])

  async function onSubmit(e) {


  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmedCourseCode = courseCode.trim()

    if (!trimmedCourseCode) {
      setError('Course code is required')
      return
    }

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5')
      return
    }

    // Joi compatible format: plain object.
    // axios (used in api.js) will automatically stringify this to JSON.
    const payload = {
      courseCode: trimmedCourseCode,
      rating: Number(rating),
      comment: comment
    }

    try {
      if (id) {
        await api(`/api/reviews/${id}`, {
          method: 'PATCH',
          data: payload
        })
      } else {
        await api('/api/reviews', {
          method: 'POST',
          data: payload
        })
      }
      nav('/reviews')
    } catch (err) {
      setError(err.message || 'Failed to save review')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'Write'} Review
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            Course Code
          </label>

          {availableCourses.length > 0 ? (
            <select
              className="input w-full"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              required
            >
              <option value="">Select a course...</option>
              {availableCourses.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          ) : (
            <input
              className="input w-full"
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CSEN604"
              required
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Rating
          </label>

          <select
            className="input w-full"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Comment
          </label>

          <textarea
            className="input w-full"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review..."
            rows={5}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        <button className="btn" type="submit">
          Save
        </button>
      </form>
    </div>
  )
}