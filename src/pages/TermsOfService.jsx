import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const TermsOfService = () => {
  const [showNavLine, setShowNavLine] = useState(false)
  const [signupHover, setSignupHover] = useState(false)
  const [signupPressed, setSignupPressed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowNavLine(true)
      } else {
        setShowNavLine(false)
      }
    }

    // Set background to white for terms page
    document.body.style.backgroundColor = '#ffffff'
    document.documentElement.style.backgroundColor = '#ffffff'

    // Function to scroll to regulatory compliance section
    const scrollToRegulatoryCompliance = () => {
      const element = document.getElementById('regulatory-compliance')
      if (element) {
        const yOffset = -150 // Account for fixed nav bar
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }

    // Scroll to hash if present on mount
    const hash = window.location.hash
    if (hash === '#regulatory-compliance') {
      setTimeout(scrollToRegulatoryCompliance, 100)
    }

    // Handle hash changes
    const handleHashChange = () => {
      if (window.location.hash === '#regulatory-compliance') {
        setTimeout(scrollToRegulatoryCompliance, 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      width: '100%'
    }}>
      {/* Sticky Nav Bar - Fixed overlay, doesn't push content */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        zIndex: 1000,
        width: '100%'
      }}>
        <div style={{
          height: '83px', // 64px * 1.3 = 83.2px (30% taller)
          width: '100%',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 250px' // Keep original padding
        }}>
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#2563eb',
              textDecoration: 'none'
            }}
          >
            curare
          </Link>

          {/* Signup Button */}
          <button
            type="button"
            onMouseEnter={() => setSignupHover(true)}
            onMouseLeave={() => {
              setSignupHover(false)
              setSignupPressed(false)
            }}
            onMouseDown={() => setSignupPressed(true)}
            onMouseUp={() => setSignupPressed(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateX(120px)' // Move 120px to the right
            }}
          >
            <img
              src={
                signupPressed
                  ? '/signuppressedhp.svg'
                  : signupHover
                  ? '/signuphoverhp.svg'
                  : '/signupdefaulthp.svg'
              }
              alt="Sign Up"
              style={{
                height: '56px',
                width: 'auto',
                display: 'block'
              }}
            />
          </button>
        </div>
        
        {/* Fade-in line at bottom - full width */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2pt',
          backgroundColor: showNavLine ? '#d0d1d2' : 'transparent',
          transition: 'background-color 0.3s ease',
          width: '100%'
        }} />
      </nav>

      <article style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '150px 40px 80px' // Increased top padding to account for fixed nav
      }}>
        {/* Effective Date */}
        <p style={{
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: '14px',
          fontWeight: 400,
          color: '#000000',
          margin: '0 0 20px 0',
          textAlign: 'center'
        }}>
          January 1, 2026.
        </p>

        {/* Main Header */}
        <h1 style={{
          fontFamily: "'Unbounded', sans-serif",
          fontSize: '48px',
          fontWeight: 400, // Unbounded unbolded
          color: '#000000',
          margin: '0 0 24px 0',
          textAlign: 'center',
          lineHeight: '1.2'
        }}>
          Terms and Conditions
        </h1>

        {/* Header Image */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '40px'
        }}>
          <img
            src="/termsandconditions.svg"
            alt="Terms and Conditions"
            style={{
              width: '100%',
              maxWidth: '600px',
              height: 'auto'
            }}
          />
        </div>

        {/* Content */}
        <div style={{
          marginTop: '60px'
        }}>
          {/* Executive Summary */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700, // Inter Tight bolded
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Executive Summary
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400, // Inter Tight unbolded
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                We are committed to protecting user privacy and security on Curare. We comply with major data protection laws (COPPA, GDPR, CCPA/CPRA, Malaysia PDPA) and follow industry best practices. Our team has developed a comprehensive compliance program covering legal research, privacy and terms policies, UI/UX for consent, data retention, security, and risk management. We operate in a transparent way: our Privacy Policy clearly explains what data we collect, how we use it, and what rights users and parents/guardians have. In summary:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Privacy & Security Focus:</strong> We minimize data collection to what's needed for our education services, encrypt data in transit and at rest, and regularly audit our systems. We maintain technical safeguards and organizational controls to keep data confidential and available. For example, we secure children's data with "reasonable procedures", which minimizes collection and deletes it when no longer needed.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Regulatory Compliance:</strong> We follow all requirements of COPPA for children under 13 (detailed below). We follow GDPR for EU users by using lawful bases (such as consent) for processing, and respecting data subject rights like access, correction, and deletion. We uphold Article 8 of the GDPR: if children under the EU consent age use our services, we verify parental consent. In California, we honor CCPA/CPRA rights: consumers can know what we collect, delete data, and opt out of any data sale. In Malaysia, we implement PDPA's requirements, which require obtaining consent before data collection and adherence to data protection principles.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- User Rights & Notices:</strong> We provide clear notices and obtain consent where required. Our Privacy Policy lists all categories of personal data we collect, how we use and disclose it, and includes contact information for all parties handling children's data. We have an age-verification and parental consent workflow so that parents approve any collection from children. We provide opt-in cookie consent and make it easy for users to exercise their rights (for example, Californians can submit "Right to Know/Delete" requests).
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Parental Consent and Cookie Interfaces:</strong> Our product design includes special flows for minors. We collect ages at sign-up and if a user is under 13, we immediately inquire a parent or guardian to provide verifiable consent (by email link, form, or other approved method). We give parents direct notice of what data we want to collect and why, and obtain explicit permission before any child information is collected. Likewise, our cookie banner clearly explains cookie categories (e.g. analytics, marketing) and requires an affirmative choice to enable non-essential cookies, complying with GDPR/ePrivacy rules for explicit consent.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Data Handling and Retention:</strong> We retain personal data only as long as necessary. For example, user account data is kept while the account is active and for a defined period after deletion, after which it is purged or anonymized. This follows PDPA and GDPR retention principles. All data disposal is done securely.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Continuous Review:</strong> This documentation, including our Privacy Policy and TOS, will be periodically reviewed. We involve legal counsel to confirm compliance with evolving laws.
              </p>
            </div>
          </section>

          {/* Legal Research / Regulatory Compliance */}
          <section id="regulatory-compliance" style={{ marginBottom: '40px', scrollMarginTop: '150px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Legal Research (COPPA, GDPR, CCPA, PDPA)
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                We have analyzed the following laws to guide our policies and design. All discussion below refers to Curare's practices.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- COPPA (US Children's Privacy):</strong> COPPA governs online services directed at children under 13 or those that knowingly collect data from under-13 users. We treat COPPA as applicable because Curare is an education platform and may attract minors. Under COPPA, we must provide a clear, comprehensive privacy policy and obtain verifiable parental consent before collecting any personal information from children under 13. Our privacy notices explicitly describe what information we collect, how we use it, and which third parties (if any) receive children's data. Finally, COPPA requires us to maintain reasonable security procedures: we minimize data collected, secure it with encryption and access controls, and dispose of it when no longer needed.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- GDPR (EU General Data Protection Regulation):</strong> GDPR applies to processing personal data of EU residents. We ensure that all processing has a lawful basis (such as consent for marketing or contract for service delivery). We honor all GDPR data subject rights: for example, users can request access to or deletion of their data, and can correct inaccuracies. In particular, Article 8 of GDPR gives special protection to children's data in online services so that if a child is under 16 (or as low as 13, per local law), we must obtain and verify parental consent for processing that child's data. We have thus implemented age checks and consent verification to satisfy these rules. We also follow GDPR principles of transparency (providing clear notices), data minimization, purpose limitation, and integrity/confidentiality. All EU user data is stored securely, and we would notify authorities and affected individuals in the event of a breach as required by GDPR.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- CCPA/CPRA (California Privacy Law):</strong> The California Consumer Privacy Act (as amended by CPRA) grants California residents enhanced privacy rights. We have procedures to comply where applicable. California users have the right to know what personal information we collect and how we use or share it, to delete their data (with certain exceptions), and to opt out of any sales or sharing of their personal information. (Our business model does not involve selling data, but nonetheless honor the opt-out right). As of 2023, CPRA also gives Californians the right to correct inaccurate data we hold and to limit the use of sensitive personal information. We ensure our Privacy Policy and user interfaces clearly inform California users of these rights, and we have processes in place to respond to requests (for access, deletion, etc.) in the legally prescribed timeframe. We also note that California law requires posting a "Do Not Sell or Share My Personal Information" link on our site if we ever engage in data sale/sharing (currently not applicable but monitored). Our compliance framework treats CCPA/CPRA as governing California resident data alongside GDPR.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Malaysia PDPA (Personal Data Protection Act 2010):</strong> Under Malaysia's PDPA, we must adhere to principles of personal data protection when handling data of Malaysian citizens. The PDPA mandates that we obtain consent from individuals before collecting, using, or disclosing their personal data. We have implemented consent mechanisms accordingly (for example, acceptance of our terms and privacy notice when users register). The PDPA sets out seven key principles (including Notice & Choice, Disclosure, Security, Retention, Integrity, and Access). We comply with these by providing notice of purposes, not disclosing data beyond what was agreed, securing data appropriately, and limiting retention. Notably, under the Retention Principle, we keep personal data only as long as it is necessary for the purposes collected, then delete or anonymize it. In practice, this means we set specific retention periods for each data type (see Data Retention section). If our data processing ever requires it (for example, if we reach certain thresholds of data volume), we will appoint a Data Protection Officer to oversee our practices. We regularly review our PDPA compliance and will update our practices in response to any regulatory changes.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                In summary, we have mapped our obligations under each law to our operational practices. We continuously monitor changes to these laws (for example, GDPR's upcoming ePrivacy updates, CRPA implementation, or PDPA amendments) and adjust our policies accordingly.
              </p>
            </div>
          </section>

          {/* Parental Consent UI and Backend Design */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Parental Consent UI and Backend Design
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                When a user indicates they are a minor (typically under 13), we immediately engage in a COPPA-compliant consent process. Our approach is:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Age Verification:</strong> During onboarding (before Sign-Up), we require the user's age (using a slider mechanic). If their age is under 13 (or under the local digital consent age), their data will not be collected unless a parent/guardian submits a form sent via email, or they complete a verification process in their settings.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Parental Notice:</strong> We collect the parent/guardian's email address and send an email (or other direct message) once the account is created, that clearly explains our data practices. The notice tells the parent/guardian: who we are, what information we plan to collect about the child, the purpose of collection, that parental consent is not required, and how to review or revoke consent. This mirrors the FTC's guidelines for "direct notice". The email includes a link to our COPPA-specific consent form and our Privacy Policy.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Verifiable Consent:</strong> Our backend provides a verifiable consent form for the parent/guardian. Possible methods include: clicking a secure link in the email, or signing and uploading the form in our settings. We typically use an emailed link plus a confirmation code ("email plus") for simplicity, followed by a confirmation email as required. We ensure the consent method is reasonably designed to be given by the actual parent or guardian, per COPPA rules.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Consent Record:</strong> Once the parent/guardian consents, our backend associates that consent with the child's account. We store a record of the consent timestamp, method, and what was agreed. No child data is collected until this link is established. We log every step (notice sent, consent given) for auditing.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Revocation and Review:</strong> Parents/Guardians can revisit and revoke consent at any time. We provide a parent portal in our settings (or support contact) where a parent/guardian can request the child's data, request edits or deletion, or withdraw permission. If consent is withdrawn, we stop collecting new data, delete the child's account and data promptly, and retain only minimal required records (e.g. proof of withdrawal).
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Data Minimization:</strong> In line with COPPA, we never ask the child or parent/guardian to disclose more information than necessary. For example, if signing up for a quiz does not require a certain cookie, we do not ask or apply it. Our forms and API do not include hidden fields that collect additional data from children.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                This UI/UX design and backend workflow meet COPPA's requirements and ensure we respect parental authority and data safety.
              </p>
            </div>
          </section>

          {/* Cookie Consent UI and Technical Implementation */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Cookie Consent UI and Technical Implementation
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                We have built a robust cookie consent system to comply with GDPR/ePrivacy requirements. Key aspects:
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Cookie Implementation:</strong> During onboarding, we display a dedicated page (or a pop-up) that informs the user about our use of cookies and similar technologies. The page briefly explains cookie categories (Necessary, Analytics, Marketing) and provides options to Accept All, Only Essential Cookies, or Manage Later. This page remains visible until the user makes a choice. This page is skipped entirely if the user's age is under 13.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Explicitly Opt-In:</strong> For any non-essential cookies (like analytics or marketing), we require explicit opt-in. We do not set those cookies until the user clicks "Accept" or explicitly toggles them on. This satisfies the requirement for "clear and unambiguous" consent. For example, if a user declines, we still load the site with only strictly necessary cookies.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Granular Controls:</strong> If the user chooses "Manage Later," after onboarding we open a detailed modal (if ignored, will revert to only essential cookies) that lists cookie categories and gives toggles. For example, a user might allow analytics cookies but not marketing ones. This granular choice meets the principle of giving visitors choice over each category. The modal also includes a short explanation of what each category does.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                Once a choice is made, we save it (e.g. in a cookie or local storage). We record the user's choices in our system so that on future visits we remember their preferences. We also log the consent timestamp for auditing. A user can revisit the preferences from a persistent link (either from "Cookie Settings" in our footer, or our settings menu at any time).
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- No Prior Tracking:</strong> Technically, we implemented consent checking on every script and page load. All our tracking and analytics scripts are wrapped in code that checks for consent before loading. For example, we only execute Google Analytics code and Admin Analytics if the user has opted in to analytics cookies. This ensures compliance with GDPR's requirement that consent be obtained before tracking begins.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>- Cookie Policy Details:</strong> Our Privacy/Cookie Policy page provides a full table of cookies, their purposes, and retention times. We also include information on how users can withdraw consent or disable cookies (e.g. browser settings), beyond our consent and settings page.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                By combining a clear UI with technical enforcement, we ensure cookies are only used with user permission. We monitor cookie usage with a Consent Management Platform to stay up-to-date with legal requirements and new categories.
              </p>
            </div>
          </section>

          {/* Billing & Payment */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#000000',
              margin: '0 0 16px 0'
            }}>
              Billing & Payment
            </h2>
            <div style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>How our payments are processed:</strong> We use Stripe as our payment processor to handle purchases, subscriptions, and related payment flows. When you make a payment (one-time or recurring), Stripe collects and processes your card or payment details; Curare receives only tokenized payment identifiers and transaction records necessary to verify and record the purchase. We do not store full card numbers on our servers.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>What Stripe does for us (and you):</strong> Stripe tokenizes card data, manages PCI scope for payments, issues receipts/invoices, and (where enabled) calculates and collects applicable taxes. Stripe also handles our common payment workflow mechanics such as retries for failed charges and payment confirmations. Using Stripe reduces the amount of payment data we need to handle directly, but it does not remove your rights or our obligations under this policy.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Data shared with Stripe:</strong> To complete a transaction we share the minimum required information with Stripe and related banks or service providers. This includes the payer name, billing address, email, transaction amount, and order/invoice details. Stripe's handling of payment data is governed by its own privacy policy and terms; please review Stripe's documentation for details. We may also receive from Stripe transaction metadata, token IDs, and receipts necessary for our records and support.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Taxes and Invoicing:</strong> Where available and enabled, Stripe may calculate and collect applicable taxes, and provide receipts or invoices. Any tax collected will be shown at checkout. Curare does not provide tax advice. Details about tax charges on a transaction, your Stripe receipt of invoice will include the specifics.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Subscriptions, automatic renewal & cancellations:</strong> Subscription billing (our Pro plan) is managed through Stripe. Subscriptions auto-renew according to the plan selected unless cancelled before the renewal date. Billing frequency, renewal timing, and cancellation instructions are presented at checkout. If you cancel, the cancellation will take effect per the billing rules shown at purchase (for the Pro plan; the end of the current billing period).
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Refunds and disputes:</strong> Refunds are issued at Curare's discretion in accordance with our refund policy. For chargebacks or disputes, we will cooperate with the payment processor and financial institutions and may provide transaction records to defend legitimate charges.
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Failed Payments & Suspension:</strong> If a payment fails, we may suspend access to paid features until payment is successfully processed. It is the user's responsibility to keep billing information current.
              </p>
            </div>
          </section>

          {/* Effective Date */}
          <section style={{ marginBottom: '40px' }}>
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '16px',
              fontWeight: 400,
              color: '#000000',
              margin: '40px 0 0 0',
              lineHeight: '1.6'
            }}>
              Effective Date: January 1, 2026.
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}

export default TermsOfService
