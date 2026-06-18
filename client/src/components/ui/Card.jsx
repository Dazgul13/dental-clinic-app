import React from 'react'
import PropTypes from 'prop-types'

export default function Card({ children, raised = false, className = '', ...rest }) {
  const cls = `pd-card ${raised ? 'pd-card--raised' : ''} ${className}`
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  )
}

Card.propTypes = {
  raised: PropTypes.bool,
  children: PropTypes.node,
}
