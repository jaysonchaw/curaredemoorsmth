const WaitlistSignup = () => {
  const handleSubmit = (e) => {
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)
    
    // Redirect to Google Form with pre-filled email if provided
    const email = formData.get('email')
    const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe2IvplhauXDQYrOAtTSaqYGW1kCcz7B9lf2SQTGJHrTGXA2Q/viewform?usp=header'
    
    if (email) {
      // Open Google Form in new tab
      window.open(googleFormUrl, '_blank')
    } else {
      window.open(googleFormUrl, '_blank')
    }
  }

  return (
    <section id="waitlist-signup" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-semibold text-black mb-4">Join Our Waitlist</h2>
        <p className="text-gray-600 mb-8">
          Be the first to know when Curare launches. Enter your email below.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-curare-blue focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-curare-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  )
}

export default WaitlistSignup

