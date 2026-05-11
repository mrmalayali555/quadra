import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          background: '#1a1a1a',
          color: '#fff',
          fontFamily: 'monospace',
          minHeight: '100vh',
          overflow: 'auto'
        }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>⚠️ App Error</h1>
          <pre style={{
            background: '#0f0f0f',
            padding: '15px',
            borderRadius: '5px',
            overflow: 'auto',
            border: '1px solid #ff6b6b'
          }}>
            <strong>Error:</strong> {this.state.error?.toString()}
            
{'\n\n'}
<strong>Stack:</strong> {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#38bdf8',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload App
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
