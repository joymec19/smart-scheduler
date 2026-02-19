import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
          <span className="text-6xl mb-4">😕</span>
          <h2 className="text-gray-800 font-semibold text-lg mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-semibold text-sm shadow-md active:scale-95 transition-transform"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
