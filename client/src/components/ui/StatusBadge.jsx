import React from 'react'
import PropTypes from 'prop-types'
import Badge from 'react-bootstrap/Badge'

const STATUS_MAP = {
  success: 'pd-badge--success',
  warning: 'pd-badge--warning',
  danger: 'pd-badge--danger',
  info: 'pd-badge--info',
  neutral: 'pd-badge--neutral',
  primary: 'pd-badge--primary',
}

export default function StatusBadge({ status = 'neutral', children }) {
  const cls = `pd-status-badge ${STATUS_MAP[status] || STATUS_MAP.neutral}`
  return (
    <Badge pill className={cls}>
      {children}
    </Badge>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral', 'primary']),
  children: PropTypes.node,
}
