import React from 'react'
import PropTypes from 'prop-types'
import Button from './Button'

export default function NoResultsState({ query, onClear }) {
  return (
    <div className="text-center pd-no-results">
      <i className="bi bi-search" style={{ fontSize: 40 }} />
      <div className="mt-3">No results for "{query}"</div>
      {onClear && <div className="mt-3"><Button variant="outline" onClick={onClear}>Clear</Button></div>}
    </div>
  )
}

NoResultsState.propTypes = {
  query: PropTypes.string,
  onClear: PropTypes.func,
}
