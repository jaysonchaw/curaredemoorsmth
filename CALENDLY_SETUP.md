# Calendly Integration Setup

The "Book Demo" button on the For Schools page uses Calendly to embed a scheduling calendar.

## Setup Instructions

1. **Create a Calendly Account**
   - Go to https://calendly.com
   - Sign up for a free account

2. **Create an Event Type**
   - In your Calendly dashboard, create a new event type
   - Name it something like "Curare Demo Call" or "30-minute Demo"
   - Set the duration (e.g., 30 minutes)
   - Configure availability, timezone, and other settings

3. **Get Your Calendly Event URL**
   - In your Calendly dashboard, go to your event type
   - Copy the event URL (format: `https://calendly.com/your-username/event-name`)

4. **Update the Code**
   - Open `src/pages/ForSchools.jsx`
   - Find the line with `data-url="https://calendly.com/curare-demo/30min"`
   - Replace it with your actual Calendly event URL

## Example

```jsx
<div 
  className="calendly-inline-widget" 
  data-url="https://calendly.com/your-username/curare-demo"
  style={{ minWidth: '320px', height: '700px' }}
/>
```

## Customization

You can customize the Calendly widget by:
- Adjusting the height in the `style` prop
- Adding Calendly embed parameters to the URL (see Calendly docs)
- Styling the modal container

## Testing

1. Click "Book Demo" on the For Schools page
2. The Calendly calendar should load in the modal
3. Test booking a demo to ensure it works correctly







