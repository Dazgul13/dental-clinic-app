import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

export default function EmptyState({ icon = 'bi-people', message, actionLabel, onAction }) {
  return (
    <div className="text-center pd-empty-state">
      <i className={`bi ${icon}`} style={{ fontSize: 48 }} />
      <div className="mt-3">{message}</div>
      {actionLabel && <div className="mt-3"><Button onClick={onAction}>{actionLabel}</Button></div>}
    </div>
  )
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
}
