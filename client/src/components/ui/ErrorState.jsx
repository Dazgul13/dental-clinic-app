import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="text-center pd-error-state">
      <i className="bi bi-exclamation-triangle" style={{ fontSize: 48, color: 'var(--danger)' }} />
      <div className="mt-3">{message}</div>
      {onRetry && <div className="mt-3"><Button variant="outline" onClick={onRetry}>Retry</Button></div>}
    </div>
  )
}

ErrorState.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
}
