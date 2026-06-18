import React from 'react'
import PropTypes from 'prop-types'

export default function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="pd-skeleton">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="pd-skeleton-row" />
      ))}
    </div>
  )
}

LoadingSkeleton.propTypes = { rows: PropTypes.number }
