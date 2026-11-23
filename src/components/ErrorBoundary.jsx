import { Component } from 'react';

/** Shows a friendly message instead of a blank page if a page crashes (or a chunk fails to load after a redeploy). */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prev) {
    // Clear the error when the user navigates somewhere else.
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="py-20 text-center" role="alert">
        <p className="text-6xl" aria-hidden>
          😵‍💫
        </p>
        <h1 className="mt-4 text-3xl font-black text-ink">Oops, something went wrong</h1>
        <p className="mt-3 font-semibold text-muted">Reloading the page usually fixes it.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 rounded-full bg-violet-500 px-6 py-3 font-black text-white shadow-pop transition hover:bg-violet-600"
        >
          Reload page
        </button>
      </div>
    );
  }
}
