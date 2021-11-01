import React from 'react'
import styles from './styles.module.css'

function ExampleComponent(props) {
  const { text } = props
  
  return (
    <div className={styles.test}>
      Example Component: {text}
      <p>Other stuff</p>
    </div>
  )
}

export default ExampleComponent
